using Application.CQRS.Orders.Queries.Request;
using Application.CQRS.Orders.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Orders.Handlers.QueryHandler;

public class GetAllOrdersQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllOrdersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<OrderResponse>> Handle(GetAllOrdersQueryRequest request, CancellationToken cancellationToken)
    {
        var ordersQuery = await _unitOfWork.OrderRepository.GetAllAsync();
        var orders = ordersQuery.ToList();

        return _mapper.Map<List<OrderResponse>>(orders);
    }
}