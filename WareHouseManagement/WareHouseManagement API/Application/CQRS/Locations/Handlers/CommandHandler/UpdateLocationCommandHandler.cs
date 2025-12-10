using Application.CQRS.Locations.Commands.Request;
using AutoMapper;
using MediatR;
using Repository.Common;

namespace Application.CQRS.Locations.Handlers.CommandHandler;

public class UpdateLocationCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateLocationCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Unit> Handle(UpdateLocationCommandRequest request, CancellationToken cancellationToken)
    {
        var location = await _unitOfWork.LocationRepository.GetByIdAsync(request.Id);

        _mapper.Map(request, location);

        await _unitOfWork.LocationRepository.Update(location);
        await _unitOfWork.SaveChangeAsync();

        return Unit.Value;
    }
}
