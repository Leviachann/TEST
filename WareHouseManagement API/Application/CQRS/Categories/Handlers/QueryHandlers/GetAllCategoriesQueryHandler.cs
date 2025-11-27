using Application.CQRS.Categories.Queries.Request;
using Application.CQRS.Categories.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Categories.Handlers.QueryHandlers;

public class GetAllCategoriesQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllCategoriesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetAllCategoriesQueryResponse>> Handle(GetAllCategoriesQueryRequest request, CancellationToken cancellationToken)
    {
        var categories = await _unitOfWork.CategoryRepository.GetAllAsync();

        return _mapper.Map<List<GetAllCategoriesQueryResponse>>(categories.ToList());
    }
}