namespace Application.CQRS.Inventories.Commands.Response;
public class AddInventoriesCommandResponse
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
}