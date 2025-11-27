using Application.CQRS.Racks.Commands.Request;
using Application.CQRS.Racks.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Racks.Handlers.CommandHandler;

public class AddRackCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddRackCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<AddRackCommandResponse> Handle(AddRackCommandRequest request, CancellationToken cancellationToken)
    {
        var rack = _mapper.Map<Rack>(request);
        await _unitOfWork.RackRepository.AddAsync(rack);

        var locations = new List<Location>();

        for (int row = 1; row <= request.Rows; row++)
        {
            for (int grid = 1; grid <= request.Grids; grid++)
            {
                var location = new Location
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

                locations.Add(location);
            }
        }

        foreach (var location in locations)
        {
            await _unitOfWork.LocationRepository.AddAsync(location);
        }

        await _unitOfWork.SaveChangeAsync();

        var response = _mapper.Map<AddRackCommandResponse>(rack);
        response.LocationCount = locations.Count;

        return response;
    }
}