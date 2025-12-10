using Application.CQRS.OrderLines.Queries.Request;
using Application.CQRS.OrderLines.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.OrderLines.Handlers.QueryHandler;

public class GetOrderLinesByOrderQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOrderLinesByOrderQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetOrderLinesByOrderQueryResponse>> Handle(GetOrderLinesByOrderQueryRequest request, CancellationToken cancellationToken)
    {
        var orderLinesQuery = await _unitOfWork.OrderLineRepository.GetByOrder(request.OrderId);
        var orderLines = orderLinesQuery.ToList();

        return _mapper.Map<List<GetOrderLinesByOrderQueryResponse>>(orderLines);
    }
}