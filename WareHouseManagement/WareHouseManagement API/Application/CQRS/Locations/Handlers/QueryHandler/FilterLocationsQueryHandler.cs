using Application.CQRS.Locations.Queries.Request;
using Application.CQRS.Locations.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Locations.Handlers.QueryHandler;

public class FilterLocationsQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public FilterLocationsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<FilterLocationsQueryResponse>> Handle(FilterLocationsQueryRequest request, CancellationToken cancellationToken)
    {
        var locationsQuery = await _unitOfWork.LocationRepository.GetAllAsync();

        var filtered = locationsQuery
            .Where(l => string.IsNullOrEmpty(request.Zone) || l.Zone == request.Zone)
            .Where(l => !request.Row.HasValue || l.Row == request.Row.Value)
            .Where(l => !request.Grid.HasValue || l.Grid == request.Grid.Value)
            .Where(l => !request.MinCapacity.HasValue || l.Capacity >= request.MinCapacity.Value)
            .Where(l => !request.MaxCapacity.HasValue || l.Capacity <= request.MaxCapacity.Value)
            .ToList();

        return _mapper.Map<List<FilterLocationsQueryResponse>>(filtered);
    }
}