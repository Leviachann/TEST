using Application.CQRS.Products.Queries.Request;
using Application.CQRS.Products.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Products.Handlers.QueryHandler;

public class GetProductsByCategoryQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProductsByCategoryQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetProductsByCategoryQueryResponse>> Handle(GetProductsByCategoryQueryRequest request, CancellationToken cancellationToken)
    {
        var productsQuery = await _unitOfWork.ProductRepository.GetByCategory(request.CategoryId);
        var products = productsQuery.ToList();

        return _mapper.Map<List<GetProductsByCategoryQueryResponse>>(products);
    }
}