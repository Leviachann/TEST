using Application.CQRS.Locations.Queries.Request;
using Application.CQRS.Locations.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Locations.Handlers.QueryHandler;

public class GetByIdLocationQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetByIdLocationQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetByIdLocationQueryResponse?> Handle(GetByIdLocationQueryRequest request, CancellationToken cancellationToken)
    {
        var location = await _unitOfWork.LocationRepository.GetByIdAsync(request.Id);
        return _mapper.Map<GetByIdLocationQueryResponse>(location);
    }
}