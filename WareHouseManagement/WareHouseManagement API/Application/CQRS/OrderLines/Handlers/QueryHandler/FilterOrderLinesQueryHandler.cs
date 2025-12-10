using Application.CQRS.OrderLines.Queries.Request;
using Application.CQRS.OrderLines.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.OrderLines.Handlers.QueryHandler;

public class FilterOrderLinesQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public FilterOrderLinesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<FilterOrderLinesQueryResponse>> Handle(FilterOrderLinesQueryRequest request, CancellationToken cancellationToken)
    {
        var orderLinesQuery = await _unitOfWork.OrderLineRepository.GetAllAsync();

        if (request.OrderId.HasValue)
            orderLinesQuery = orderLinesQuery.Where(ol => ol.OrderId == request.OrderId.Value);

        if (request.ProductId.HasValue)
            orderLinesQuery = orderLinesQuery.Where(ol => ol.ProductId == request.ProductId.Value);

        if (request.MinQuantity.HasValue)
            orderLinesQuery = orderLinesQuery.Where(ol => ol.QuantityOrdered >= request.MinQuantity.Value);

        if (request.MaxQuantity.HasValue)
            orderLinesQuery = orderLinesQuery.Where(ol => ol.QuantityOrdered <= request.MaxQuantity.Value);

        var orderLines = orderLinesQuery.ToList();

        return _mapper.Map<List<FilterOrderLinesQueryResponse>>(orderLines);
    }
}