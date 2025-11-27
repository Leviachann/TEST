using Domain.BaseEntities;
namespace Domain.Entities;

public class Location:BaseEntity
{
    public int Row {  get; set; }
    public int Grid { get; set; }
    public string Zone { get; set; }
    public int Capacity { get; set; }
    public string XCoordinates { get; set; }
    public string YCoordinates { get; set; }
    public string ZCoordinates { get; set; }
    public string Description { get; set; }
    public Inventory Inventory { get; set; }

    public Guid? RackId { get; set; } 
    public int? RowNumber { get; set; }
    public int? GridNumber { get; set; }

    public Rack Rack { get; set; }

}
