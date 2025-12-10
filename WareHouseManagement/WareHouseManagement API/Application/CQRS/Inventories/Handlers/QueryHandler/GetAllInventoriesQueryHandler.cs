using Application.CQRS.Inventories.Query.Request;
using Application.CQRS.Inventories.Query.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Inventories.Handlers.QueryHandler;

public class GetAllInventoriesQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllInventoriesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetAllInventoriesQueryResponse>> Handle(GetAllInventoriesQueryRequest request, CancellationToken cancellationToken)
    {
        var inventoriesQuery = await _unitOfWork.InventoryRepository.GetAllAsync();
        var inventories = inventoriesQuery.ToList();

        return _mapper.Map<List<GetAllInventoriesQueryResponse>>(inventories);
    }
}