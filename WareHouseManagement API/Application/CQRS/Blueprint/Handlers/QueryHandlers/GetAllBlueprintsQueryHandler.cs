using Application.CQRS.Blueprints.Queries.Request;
using Application.CQRS.Blueprints.Queries.Response;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Repository.Common;

namespace Application.CQRS.Blueprints.Handlers.QueryHandler;

public class GetAllBlueprintsQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllBlueprintsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetAllBlueprintsQueryResponse>> Handle(GetAllBlueprintsQueryRequest request, CancellationToken cancellationToken)
    {
        var blueprintsQuery = await _unitOfWork.BlueprintRepository.GetAllAsync();
        var blueprints = await blueprintsQuery.ToListAsync();
        return _mapper.Map<List<GetAllBlueprintsQueryResponse>>(blueprints);
    }
}