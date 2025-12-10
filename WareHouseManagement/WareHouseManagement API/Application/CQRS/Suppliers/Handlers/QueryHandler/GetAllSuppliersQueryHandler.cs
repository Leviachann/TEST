using Application.CQRS.Suppliers.Queries.Request;
using Application.CQRS.Suppliers.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Suppliers.Handlers.QueryHandler;

public class GetAllSuppliersQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllSuppliersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetAllSuppliersQueryResponse>> Handle(GetAllSuppliersQueryRequest request, CancellationToken cancellationToken)
    {
        var suppliersQuery = await _unitOfWork.SupplierRepository.GetAllAsync();
        var suppliers = suppliersQuery.ToList();

        return _mapper.Map<List<GetAllSuppliersQueryResponse>>(suppliers);
    }
}