using Application.CQRS.Categories.Queries.Request;
using Application.CQRS.Categories.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Categories.Handlers.QueryHandlers;

public class FilterCategoriesQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public FilterCategoriesQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<FilterCategoriesQueryResponse>> Handle(FilterCategoriesQueryRequest request, CancellationToken cancellationToken)
    {
        var categoriesQuery = await _unitOfWork.CategoryRepository.GetAllAsync();

        var filtered = categoriesQuery
            .Where(c => string.IsNullOrEmpty(request.Name) || c.Name.ToLower().Contains(request.Name.ToLower()))
            .ToList();

        return _mapper.Map<List<FilterCategoriesQueryResponse>>(filtered);
    }
}