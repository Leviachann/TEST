namespace Application.CQRS.Orders.Commands.Response;

public class DeleteOrderCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}
