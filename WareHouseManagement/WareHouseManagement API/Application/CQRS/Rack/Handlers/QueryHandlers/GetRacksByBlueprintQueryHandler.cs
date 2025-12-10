using Application.CQRS.Racks.Queries.Request;
using Application.CQRS.Racks.Queries.Response;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Repository.Common;

namespace Application.CQRS.Racks.Handlers.QueryHandler;

public class GetRacksByBlueprintQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetRacksByBlueprintQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetRacksByBlueprintQueryResponse>> Handle(GetRacksByBlueprintQueryRequest request, CancellationToken cancellationToken)
    {
        var racksQuery = await _unitOfWork.RackRepository.GetByBlueprintIdAsync(request.BlueprintId);
        var racks = await racksQuery.ToListAsync();
        return _mapper.Map<List<GetRacksByBlueprintQueryResponse>>(racks);
    }
}