using Application.CQRS.Products.Queries.Request;
using Application.CQRS.Products.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Products.Handlers.QueryHandler;

public class GetAllProductsQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllProductsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetAllProductsQueryResponse>> Handle(GetAllProductsQueryRequest request, CancellationToken cancellationToken)
    {
        var productsQuery = await _unitOfWork.ProductRepository.GetAllAsync();
        var products = productsQuery.ToList();

        return _mapper.Map<List<GetAllProductsQueryResponse>>(products);
    }
}