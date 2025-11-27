using Application.CQRS.Orders.Queries.Request;
using Application.CQRS.Orders.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Orders.Handlers.QueryHandler;

public class FilterOrdersQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public FilterOrdersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<OrderResponse>> Handle(FilterOrdersQueryRequest request, CancellationToken cancellationToken)
    {
        var ordersQuery = await _unitOfWork.OrderRepository.GetAllAsync();

        if (request.SupplierId.HasValue)
            ordersQuery = ordersQuery.Where(o => o.SupplierId == request.SupplierId.Value);

        if (request.MinOrderDate.HasValue)
            ordersQuery = ordersQuery.Where(o => o.OrderDate >= request.MinOrderDate.Value);

        if (request.MaxOrderDate.HasValue)
            ordersQuery = ordersQuery.Where(o => o.OrderDate <= request.MaxOrderDate.Value);

        if (request.Status.HasValue)
            ordersQuery = ordersQuery.Where(o => o.OrderArrivalStatus == request.Status.Value);

        var orders = ordersQuery.ToList();

        return _mapper.Map<List<OrderResponse>>(orders);
    }
}