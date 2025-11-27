using Application.CQRS.Locations.Commands.Request;
using Application.CQRS.Locations.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Locations.Handlers.CommandHandler;

public class AddLocationCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddLocationCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<AddLocationCommandResponse> Handle(AddLocationCommandRequest request, CancellationToken cancellationToken)
    {

        var location = _mapper.Map<Location>(request);

        await _unitOfWork.LocationRepository.AddAsync(location);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<AddLocationCommandResponse>(location);
    }
}
