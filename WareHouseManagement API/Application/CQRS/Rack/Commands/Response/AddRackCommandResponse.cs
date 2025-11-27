namespace Application.CQRS.Racks.Commands.Response;

public class AddRackCommandResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public Guid BlueprintId { get; set; }
    public decimal PositionX { get; set; }
    public decimal PositionY { get; set; }
    public int LocationCount { get; set; }
    public DateTime CreatedDate { get; set; }
}