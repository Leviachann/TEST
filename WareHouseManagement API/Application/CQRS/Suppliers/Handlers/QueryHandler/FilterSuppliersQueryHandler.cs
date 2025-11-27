using Application.CQRS.Suppliers.Queries.Request;
using Application.CQRS.Suppliers.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Suppliers.Handlers.QueryHandler;

public class FilterSuppliersQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public FilterSuppliersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<FilterSuppliersQueryResponse>> Handle(FilterSuppliersQueryRequest request, CancellationToken cancellationToken)
    {
        var suppliersQuery = await _unitOfWork.SupplierRepository.GetAllAsync();

        var filtered = suppliersQuery
            .Where(s =>
                (string.IsNullOrEmpty(request.Country) || s.Country.ToLower().Contains(request.Country.ToLower())) &&
                (string.IsNullOrEmpty(request.NameContains) || s.Name.ToLower().Contains(request.NameContains.ToLower())) &&
                (string.IsNullOrEmpty(request.EmailContains) || s.Email.ToLower().Contains(request.EmailContains.ToLower())))
            .ToList();

        return _mapper.Map<List<FilterSuppliersQueryResponse>>(filtered);
    }
}