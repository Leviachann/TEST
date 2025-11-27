using Application.CQRS.Categories.Queries.Request;
using Application.CQRS.Categories.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Categories.Handlers.QueryHandlers;

public class GetCategoryByIdQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetCategoryByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetCategoryByIdQueryResponse?> Handle(GetCategoryByIdQueryRequest request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(request.Id);

        return _mapper.Map<GetCategoryByIdQueryResponse>(category);
    }
}