using Application.CQRS.Locations.Commands.Request;
using Application.CQRS.Locations.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Locations.Handlers.CommandHandler;

public class DeleteLocationCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteLocationCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DeleteLocationCommandResponse> Handle(DeleteLocationCommandRequest request, CancellationToken cancellationToken)
    {
        var location = _mapper.Map<Location>(request);

        await _unitOfWork.LocationRepository.Remove(location.Id);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<DeleteLocationCommandResponse>(location);
    }
}
