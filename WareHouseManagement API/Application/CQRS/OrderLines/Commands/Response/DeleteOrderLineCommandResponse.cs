namespace Application.CQRS.OrderLines.CommandsResponse;

public class DeleteOrderLineCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}
