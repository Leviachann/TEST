using Application.CQRS.OrderLines.Commands.Request;
using Application.CQRS.OrderLines.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.OrderLines.Handlers.ControllerHandler;

public class AddOrderLineCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddOrderLineCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<AddOrderLineCommandResponse> Handle(AddOrderLineCommandRequest request, CancellationToken cancellationToken)
    {
        var orderLine = _mapper.Map<OrderLine>(request);

        await _unitOfWork.OrderLineRepository.AddAsync(orderLine);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<AddOrderLineCommandResponse>(orderLine);
    }
}
