using Application.CQRS.Orders.Queries.Request;
using Application.CQRS.Orders.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Orders.Handlers.QueryHandler;

public class GetOrdersBySupplierQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOrdersBySupplierQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<OrderResponse>> Handle(GetOrdersBySupplierQueryRequest request, CancellationToken cancellationToken)
    {
        var ordersQuery = await _unitOfWork.OrderRepository.GetOrdersBySupplier(request.SupplierId);
        var orders = ordersQuery.ToList();

        return _mapper.Map<List<OrderResponse>>(orders);
    }
}