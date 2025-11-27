using Application.CQRS.OrderLines.Queries.Request;
using Application.CQRS.OrderLines.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.OrderLines.Handlers.QueryHandler;

public class GetOrderLineByIdQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetOrderLineByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetOrderLineByIdQueryResponse?> Handle(GetOrderLineByIdQueryRequest request, CancellationToken cancellationToken)
    {
        var orderLine = await _unitOfWork.OrderLineRepository.GetByIdAsync(request.Id);
        return _mapper.Map<GetOrderLineByIdQueryResponse>(orderLine);
    }
}