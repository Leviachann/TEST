namespace Application.CQRS.Orders.Commands.Request;

public class DeleteOrderCommandRequest
{
    public Guid Id { get; set; }
}
