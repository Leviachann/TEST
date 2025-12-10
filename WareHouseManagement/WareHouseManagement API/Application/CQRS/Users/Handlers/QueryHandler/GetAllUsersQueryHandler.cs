using Application.CQRS.Users.Queries.Request;
using Application.CQRS.Users.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Users.Handlers.QueryHandler;

public class GetAllUsersQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
     
    public GetAllUsersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<GetAllUsersQueryResponse>> Handle(GetAllUsersQueryRequest request, CancellationToken cancellationToken)
    {
        var usersQuery = await _unitOfWork.UserRepository.GetAllAsync();
        var users = usersQuery.ToList();

        return _mapper.Map<List<GetAllUsersQueryResponse>>(users);
    }
}