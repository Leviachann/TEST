using Application.CQRS.Users.Commands.Request;
using Application.CQRS.Users.Commands.Response;
using AutoMapper;
using Common.Extensions;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Users.Handlers.CommandHandler;

public class RegisterUserCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RegisterUserCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<RegisterUserCommandResponse> Handle(RegisterUserCommandRequest request, CancellationToken cancellationToken)
    {
        var user = _mapper.Map<User>(request);
        user.PasswordHash = PasswordHasher.ComputeStringToSha256Hash(request.Password);

        await _unitOfWork.UserRepository.RegisterAsync(user);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<RegisterUserCommandResponse>(user);
    }
}