using Application.CQRS.OrderLines.Commands.Request;
using Application.CQRS.OrderLines.CommandsResponse;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.OrderLines.Handlers.CommandHandler;

public class DeleteOrderLineCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteOrderLineCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DeleteOrderLineCommandResponse> Handle(DeleteOrderLineCommandRequest request, CancellationToken cancellationToken)
    {
        var orderLine = _mapper.Map<Category>(request);

        await _unitOfWork.OrderLineRepository.Remove(orderLine.Id);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<DeleteOrderLineCommandResponse>(orderLine);
    }
}
