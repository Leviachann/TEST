using Application.CQRS.OrderLines.Queries.Request;
using Application.CQRS.OrderLines.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.OrderLines.Handlers.QueryHandler;

public class GetAllOrderLinesQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllOrderLinesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetAllOrderLinesQueryResponse>> Handle(GetAllOrderLinesQueryRequest request, CancellationToken cancellationToken)
    {
        var orderLinesQuery = await _unitOfWork.OrderLineRepository.GetAllAsync();
        var orderLines = orderLinesQuery.ToList();

        return _mapper.Map<List<GetAllOrderLinesQueryResponse>>(orderLines);
    }
}