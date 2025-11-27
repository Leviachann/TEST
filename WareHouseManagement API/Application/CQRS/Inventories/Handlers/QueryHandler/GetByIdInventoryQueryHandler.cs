using Application.CQRS.Inventories.Queries.Request;
using Application.CQRS.Inventories.Query.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Inventories.Handlers.QueryHandler;

public class GetByIdInventoryQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetByIdInventoryQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetByIdInventoriesQueryResponse?> Handle(GetInventoryByIdQueryRequest request, CancellationToken cancellationToken)
    {
        var inventory = await _unitOfWork.InventoryRepository.GetByIdAsync(request.Id);
        return _mapper.Map<GetByIdInventoriesQueryResponse>(inventory);
    }
}