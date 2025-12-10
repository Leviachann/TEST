using Application.CQRS.Products.Queries.Request;
using Application.CQRS.Products.Queries.Response;
using AutoMapper;
using Common.Exceptions;
using Repository.Common;

namespace Application.CQRS.Products.Handlers.QueryHandler;

public class GetProductByIdQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetProductByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetProductByIdQueryResponse> Handle(GetProductByIdQueryRequest request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.ProductRepository.GetByIdAsync(request.Id);

        if (product == null)
            throw new NotFoundException("Product not found");

        return _mapper.Map<GetProductByIdQueryResponse>(product);
    }
}