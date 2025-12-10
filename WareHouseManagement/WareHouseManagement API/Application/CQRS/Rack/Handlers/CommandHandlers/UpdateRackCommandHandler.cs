using Application.CQRS.Racks.Commands.Request;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Racks.Handlers.CommandHandler;

public class UpdateRackCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateRackCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task Handle(UpdateRackCommandRequest request, CancellationToken cancellationToken)
    {
        var rack = await _unitOfWork.RackRepository.GetByIdAsync(request.Id);

        bool needsLocationRegeneration = rack.Rows != request.Rows || rack.Grids != request.Grids;

        _mapper.Map(request, rack);
        await _unitOfWork.RackRepository.Update(rack);

        if (needsLocationRegeneration)
        {
            var oldLocations = rack.Locations.Where(l => !l.IsDeleted).ToList();
            foreach (var location in oldLocations)
            {
                await _unitOfWork.LocationRepository.Remove(location.Id);
            }

            for (int row = 1; row <= request.Rows; row++)
            {
                for (int grid = 1; grid <= request.Grids; grid++)
                {
                    var location = new Domain.Entities.Location
                    {
                        Id = Guid.NewGuid(),
                        RackId = rack.Id,
                        RowNumber = row,
                        GridNumber = grid,
                        Row = row,
                        Grid = grid,
                        Zone = $"{request.Name}-Zone",
                        Capacity = 100,
                        XCoordinates = request.PositionX.ToString(),
                        YCoordinates = request.PositionY.ToString(),
                        ZCoordinates = ((row - 1) * 0.5m).ToString(),
                        Description = $"Auto-generated location for {request.Name}",
                        CreatedDate = DateTime.UtcNow,
                        IsDeleted = false
                    };

                    await _unitOfWork.LocationRepository.AddAsync(location);
                }
            }
        }

        await _unitOfWork.SaveChangeAsync();
    }
}