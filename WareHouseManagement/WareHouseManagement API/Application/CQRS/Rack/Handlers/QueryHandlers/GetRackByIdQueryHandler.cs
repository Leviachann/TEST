using Application.CQRS.Racks.Queries.Request;
using Application.CQRS.Racks.Queries.Response;
using AutoMapper;
using Common.Exceptions;
using Repository.Common;

namespace Application.CQRS.Racks.Handlers.QueryHandler;

public class GetRackByIdQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetRackByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetRackByIdQueryResponse> Handle(GetRackByIdQueryRequest request, CancellationToken cancellationToken)
    {
        var rack = await _unitOfWork.RackRepository.GetByIdAsync(request.Id);

        if (rack == null)
            throw new NotFoundException("Rack not found");

        return _mapper.Map<GetRackByIdQueryResponse>(rack);
    }
}