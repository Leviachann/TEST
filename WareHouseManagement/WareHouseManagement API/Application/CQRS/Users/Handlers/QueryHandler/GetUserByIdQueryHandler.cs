using Application.CQRS.Users.Queries.Request;
using Application.CQRS.Users.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Users.Handlers.QueryHandler;

public class GetUserByIdQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetUserByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetUserByIdQueryResponse?> Handle(GetUserByIdQueryRequest request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(request.Id);
        return _mapper.Map<GetUserByIdQueryResponse>(user);
    }
}