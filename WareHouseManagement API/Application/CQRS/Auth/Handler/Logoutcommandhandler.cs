using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Auth.Handlers;

public class LogoutCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public LogoutCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<bool> Handle(Guid userId, CancellationToken cancellationToken)
    {
        await _unitOfWork.RefreshTokenRepository.RevokeAllUserTokensAsync(userId);
        await _unitOfWork.SaveChangeAsync();
        return true;
    }
}