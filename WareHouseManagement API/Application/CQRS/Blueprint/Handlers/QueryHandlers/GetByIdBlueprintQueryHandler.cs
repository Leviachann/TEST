using Application.CQRS.Blueprints.Queries.Request;
using Application.CQRS.Blueprints.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Blueprints.Handlers.QueryHandler;

public class GetByIdBlueprintQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetByIdBlueprintQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetByIdBlueprintQueryResponse?> Handle(GetByIdBlueprintQueryRequest request, CancellationToken cancellationToken)
    {
        var blueprint = await _unitOfWork.BlueprintRepository.GetByIdAsync(request.Id);
        return _mapper.Map<GetByIdBlueprintQueryResponse>(blueprint);
    }
}