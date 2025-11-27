namespace Application.CQRS.Inventories.Commands.Response;

public class DeleteInventoriesCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}