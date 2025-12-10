namespace Application.CQRS.Racks.Queries.Response;

public class GetRacksByBlueprintQueryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public decimal PositionX { get; set; }
    public decimal PositionY { get; set; }
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public int Rows { get; set; }
    public int Grids { get; set; }
    public int LocationCount { get; set; }
    public DateTime CreatedDate { get; set; }
}