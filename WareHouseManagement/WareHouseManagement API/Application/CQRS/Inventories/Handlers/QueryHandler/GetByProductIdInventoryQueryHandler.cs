using Application.CQRS.Inventories.Query.Request;
using Application.CQRS.Inventories.Query.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Inventories.Handlers.QueryHandler;

public class GetByProductIdInventoryQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetByProductIdInventoryQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetByProductIdInventoryQueryResponse?> Handle(GetByProductInventoryQueryRequest request, CancellationToken cancellationToken)
    {
        var inventory = await _unitOfWork.InventoryRepository.GetByProductId(request.ProductId);
        return _mapper.Map<GetByProductIdInventoryQueryResponse>(inventory);
    }
}