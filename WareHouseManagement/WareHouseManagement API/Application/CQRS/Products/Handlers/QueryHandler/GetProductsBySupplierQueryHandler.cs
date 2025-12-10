using Application.CQRS.Products.Queries.Request;
using Application.CQRS.Products.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Products.Handlers.QueryHandler;

public class GetProductsBySupplierQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProductsBySupplierQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetProductsBySupplierQueryResponse>> Handle(GetProductsBySupplierQueryRequest request, CancellationToken cancellationToken)
    {
        var productsQuery = await _unitOfWork.ProductRepository.GetBySupplier(request.SupplierId);
        var products = productsQuery.ToList();

        return _mapper.Map<List<GetProductsBySupplierQueryResponse>>(products);
    }
}