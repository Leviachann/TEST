using Application.CQRS.Orders.Commands.Request;
using Application.CQRS.Orders.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Orders.Handlers.CommandHandler;

public class DeleteOrderCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteOrderCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DeleteOrderCommandResponse> Handle(DeleteOrderCommandRequest request, CancellationToken cancellationToken)
    {
        var order = _mapper.Map<Order>(request);

        await _unitOfWork.OrderRepository.Remove(order.Id);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<DeleteOrderCommandResponse>(order);
    }
}
