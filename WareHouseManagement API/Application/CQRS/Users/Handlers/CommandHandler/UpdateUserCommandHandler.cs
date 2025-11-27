using Application.CQRS.Users.Commands.Request;
using AutoMapper;
using Common.Extensions;
using MediatR;
using Repository.Common;

namespace Application.CQRS.Users.Handlers.CommandHandler;

public class UpdateUserCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateUserCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Unit> Handle(UpdateUserCommandRequest request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(request.Id);

        _mapper.Map(request, user);

        if (!string.IsNullOrEmpty(request.Password))
        {
            user.PasswordHash = PasswordHasher.ComputeStringToSha256Hash(request.Password);
        }

        await _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveChangeAsync();

        return Unit.Value;
    }
}