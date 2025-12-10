using Application.CQRS.Products.Queries.Request;
using Application.CQRS.Products.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Products.Handlers.QueryHandler;

public class FilterProductsQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public FilterProductsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<FilterProductsQueryResponse>> Handle(FilterProductsQueryRequest request, CancellationToken cancellationToken)
    {
        var productsQuery = await _unitOfWork.ProductRepository.GetAllAsync();

        if (request.CategoryId.HasValue)
            productsQuery = productsQuery.Where(p => p.CategoryId == request.CategoryId.Value);

        if (request.SupplierId.HasValue)
            productsQuery = productsQuery.Where(p => p.SupplierId == request.SupplierId.Value);

        if (request.MinPrice.HasValue)
            productsQuery = productsQuery.Where(p => p.Price >= request.MinPrice.Value);

        if (request.MaxPrice.HasValue)
            productsQuery = productsQuery.Where(p => p.Price <= request.MaxPrice.Value);

        if (!string.IsNullOrEmpty(request.NameContains))
            productsQuery = productsQuery.Where(p => p.Name.Contains(request.NameContains));

        if (!string.IsNullOrEmpty(request.SkuContains))
            productsQuery = productsQuery.Where(p => p.SKU.Contains(request.SkuContains));

        var products = productsQuery.ToList();

        return _mapper.Map<List<FilterProductsQueryResponse>>(products);
    }
}