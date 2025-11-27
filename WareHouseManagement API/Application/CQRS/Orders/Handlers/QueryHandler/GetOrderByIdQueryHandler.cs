using Application.CQRS.Orders.Queries.Request;
using Application.CQRS.Orders.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Orders.Handlers.QueryHandler;

public class GetOrderByIdQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOrderByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<OrderResponse?> Handle(GetOrderByIdQueryRequest request, CancellationToken cancellationToken)
    {
        var order = await _unitOfWork.OrderRepository.GetByIdAsync(request.Id);
        return _mapper.Map<OrderResponse>(order);
    }
}