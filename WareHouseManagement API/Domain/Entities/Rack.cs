using Domain.BaseEntities;

namespace Domain.Entities;

public class Rack : BaseEntity
{
    public string Name { get; set; }
    public Guid BlueprintId { get; set; }

    public decimal PositionX { get; set; }
    public decimal PositionY { get; set; }

    public decimal Width { get; set; }
    public decimal Height { get; set; }

    public int Rows { get; set; }
    public int Grids { get; set; }

    public Blueprint Blueprint { get; set; }
    public ICollection<Location> Locations { get; set; }
}