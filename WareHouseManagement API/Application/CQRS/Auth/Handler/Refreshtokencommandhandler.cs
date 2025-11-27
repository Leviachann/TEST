using Application.CQRS.Auth.Requests;
using Application.CQRS.Auth.Response;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Auth.Handlers;

public class RefreshTokenCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMapper _mapper;

    public RefreshTokenCommandHandler(IUnitOfWork unitOfWork, IJwtTokenService jwtTokenService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
    }

    public async Task<LoginResponse?> Handle(RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var storedToken = await _unitOfWork.RefreshTokenRepository.GetActiveTokenAsync(request.RefreshToken);

        if (storedToken == null)
        {
            return null; 
        }

        storedToken.IsUsed = true;
        storedToken.UpdatedDate = DateTime.UtcNow;

        var newAccessToken = _jwtTokenService.GenerateAccessToken(storedToken.User);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = storedToken.UserId,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7), 
            IsRevoked = false,
            IsUsed = false,
            ReplacedByToken = newRefreshToken
        };

        storedToken.ReplacedByToken = newRefreshToken;
        await _unitOfWork.RefreshTokenRepository.Update(storedToken);

        await _unitOfWork.RefreshTokenRepository.AddAsync(newRefreshTokenEntity);
        await _unitOfWork.SaveChangeAsync();

        return new LoginResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            UserId = storedToken.User.Id,
            UserName = storedToken.User.UserName,
            Email = storedToken.User.Email,
            Role = storedToken.User.Role.ToString()
        };
    }
}