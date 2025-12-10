using Application.CQRS.OrderLines.Commands.Request;
using AutoMapper;
using MediatR;
using Repository.Common;

namespace Application.CQRS.OrderLines.Handlers.CommandHandler;

public class UpdateOrderLineCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateOrderLineCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Unit> Handle(UpdateOrderLineCommandRequest request, CancellationToken cancellationToken)
    {
        var orderLine = await _unitOfWork.OrderLineRepository.GetByIdAsync(request.Id);

        _mapper.Map(request, orderLine);

        await _unitOfWork.OrderLineRepository.Update(orderLine);
        await _unitOfWork.SaveChangeAsync();

        return Unit.Value;
    }
}
