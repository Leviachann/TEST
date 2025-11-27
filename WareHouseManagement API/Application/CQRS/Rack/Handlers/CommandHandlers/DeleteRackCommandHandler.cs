using Application.CQRS.Racks.Commands.Request;
using Application.CQRS.Racks.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Racks.Handlers.CommandHandler;

public class DeleteRackCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteRackCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DeleteRackCommandResponse> Handle(DeleteRackCommandRequest request, CancellationToken cancellationToken)
    {
        var rack = await _unitOfWork.RackRepository.GetByIdAsync(request.Id);
        await _unitOfWork.RackRepository.Remove(rack.Id);
        await _unitOfWork.SaveChangeAsync();
        return _mapper.Map<DeleteRackCommandResponse>(rack);
    }

}