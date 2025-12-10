using Application.CQRS.Locations.Queries.Request;
using Application.CQRS.Locations.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Locations.Handlers.QueryHandler;

public class GetAllLocationsQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetAllLocationsQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetAllLocationsQueryResponse>> Handle(GetAllLocationsQueryRequest request, CancellationToken cancellationToken)
    {
        var locationsQuery = await _unitOfWork.LocationRepository.GetAllAsync();
        var locations = locationsQuery.ToList();
        return _mapper.Map<List<GetAllLocationsQueryResponse>>(locations);
    }
}