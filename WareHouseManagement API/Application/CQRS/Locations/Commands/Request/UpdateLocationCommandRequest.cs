using Domain.Entities;

namespace Application.CQRS.Locations.Commands.Request;

public class UpdateLocationCommandRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Row { get; set; }
    public int Grid { get; set; }
    public string Zone { get; set; }
    public int Capacity { get; set; }
    public string XCoordinates { get; set; }
    public string YCoordinates { get; set; }
    public string ZCoordinates { get; set; }
    public string Description { get; set; }
    public Inventory? Inventory { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }
}
