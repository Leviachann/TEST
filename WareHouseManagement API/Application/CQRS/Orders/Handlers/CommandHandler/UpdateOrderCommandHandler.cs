using Application.CQRS.OrderLines.Commands.Request;
using Application.CQRS.Orders.Commands.Request;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Repository.Common;

namespace Application.CQRS.Orders.Handlers.CommandHandler
{
    public class UpdateOrderCommandHandler
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UpdateOrderCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Unit> Handle(UpdateOrderCommandRequest request, CancellationToken cancellationToken)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                var order = await _unitOfWork.OrderRepository.GetByIdAsync(request.Id);

                if (order == null)
                    throw new KeyNotFoundException($"Order with ID {request.Id} not found.");

                order.OrderDate = request.OrderDate;
                order.ArrivalTime = request.ArrivalTime;
                order.OrderArrivalStatus = request.OrderArrivalStatus;
                order.SupplierId = request.SupplierId;

                await _unitOfWork.OrderRepository.Update(order);
                await _unitOfWork.SaveChangeAsync();

                var existingLines = order.OrderLines.ToList();

                foreach (var lineDto in request.OrderLines)
                {
                    if (lineDto.Id.HasValue)
                    {
                        var existingLine = existingLines.FirstOrDefault(l => l.Id == lineDto.Id.Value);
                        if (existingLine != null)
                        {
                            existingLine.ProductId = lineDto.ProductId;
                            existingLine.QuantityOrdered = lineDto.QuantityOrdered;
                            existingLine.PriceAtOrder = lineDto.PriceAtOrder;

                            await _unitOfWork.OrderLineRepository.Update(existingLine);
                        }
                    }
                    else
                    {
                        var newLine = new OrderLine
                        {
                            OrderId = order.Id,
                            ProductId = lineDto.ProductId,
                            QuantityOrdered = lineDto.QuantityOrdered,
                            PriceAtOrder = lineDto.PriceAtOrder
                        };

                        await _unitOfWork.OrderLineRepository.AddAsync(newLine);
                    }
                }

                var toRemove = existingLines
                    .Where(l => !request.OrderLines.Any(rl => rl.Id == l.Id))
                    .ToList();

                foreach (var line in toRemove)
                {
                    line.IsDeleted = true;
                    line.DeletedDate = DateTime.UtcNow;
                    await _unitOfWork.OrderLineRepository.Update(line);
                }

                await _unitOfWork.SaveChangeAsync();
                await transaction.CommitAsync(cancellationToken);

                return Unit.Value;
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}
