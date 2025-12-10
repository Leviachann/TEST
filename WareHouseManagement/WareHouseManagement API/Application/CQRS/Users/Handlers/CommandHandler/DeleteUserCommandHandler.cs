using Application.CQRS.Users.Commands;
using Application.CQRS.Users.Commands.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Users.Handlers.CommandHandler;

public class DeleteUserCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteUserCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DeleteUserCommandResponse> Handle(DeleteUserCommandRequest request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(request.Id);
        await _unitOfWork.UserRepository.Remove(request.Id);
        await _unitOfWork.SaveChangeAsync();
        return _mapper.Map<DeleteUserCommandResponse>(user);
    }
}