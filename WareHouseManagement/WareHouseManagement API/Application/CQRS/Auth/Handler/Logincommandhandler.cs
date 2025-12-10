using Application.CQRS.Auth.Requests;
using Application.CQRS.Auth.Response;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Repository.Common;
using System.Security.Cryptography;
using System.Text;

namespace Application.CQRS.Auth.Handlers;

public class LoginCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IMapper _mapper;

    public LoginCommandHandler(IUnitOfWork unitOfWork, IJwtTokenService jwtTokenService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
        _mapper = mapper;
    }

    public async Task<LoginResponse?> Handle(LoginRequest request, CancellationToken cancellationToken)
    {
        var usersQuery = await _unitOfWork.UserRepository.GetAllAsync();
        var user = usersQuery.FirstOrDefault(u => u.UserName == request.UserName);

        if (user == null)
        {
            return null;
        }

        var hashedPassword = HashPassword(request.Password);
        if (user.PasswordHash != hashedPassword)
        {
            return null;
        }

        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7), 
            IsRevoked = false,
            IsUsed = false
        };

        await _unitOfWork.RefreshTokenRepository.AddAsync(refreshTokenEntity);
        await _unitOfWork.SaveChangeAsync();

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            UserId = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
    }
}