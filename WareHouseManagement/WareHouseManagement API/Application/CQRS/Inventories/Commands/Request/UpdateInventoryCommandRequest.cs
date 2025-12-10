namespace Application.CQRS.Inventories.Commands.Request;

public class UpdateInventoriesCommandRequest
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid LocationId { get; set; }
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public int UnitsOnOrder { get; set; }
}