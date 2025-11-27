using Application.CQRS.OrderLines.Commands.Request;
using Application.CQRS.Orders.Commands;
using Application.CQRS.Orders.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;
namespace Application.CQRS.Orders.Handlers.CommandHandler
{
    public class AddOrderCommandHandler
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public AddOrderCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<AddOrderCommandResponse> Handle(AddOrderCommandRequest request, CancellationToken cancellationToken)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var order = _mapper.Map<Order>(request);
                await _unitOfWork.OrderRepository.AddAsync(order);
                await _unitOfWork.SaveChangeAsync();
                if (request.OrderLines != null && request.OrderLines.Any())
                {
                    foreach (var lineDto in request.OrderLines)
                    {
                        var lineRequest = new AddOrderLineCommandRequest
                        {
                            OrderId = order.Id,
                            ProductId = lineDto.ProductId,
                            QuantityOrdered = lineDto.QuantityOrdered,
                            PriceAtOrder = lineDto.PriceAtOrder
                        };
                        var orderLine = _mapper.Map<OrderLine>(lineRequest);
                        await _unitOfWork.OrderLineRepository.AddAsync(orderLine);
                    }
                    await _unitOfWork.SaveChangeAsync();
                }
                await transaction.CommitAsync(cancellationToken);
                return _mapper.Map<AddOrderCommandResponse>(order);
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}