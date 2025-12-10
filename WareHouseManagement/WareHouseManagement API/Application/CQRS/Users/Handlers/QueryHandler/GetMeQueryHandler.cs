using Application.CQRS.Users.Queries.Request;
using Application.CQRS.Users.Queries;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Users.Handlers.QueryHandler;

public class GetMeQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetMeQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetMeQueryResponse?> Handle(GetMeQueryRequest request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.UserRepository.GetByIdAsync(request.UserId);

        return _mapper.Map<GetMeQueryResponse>(user);
    }
}