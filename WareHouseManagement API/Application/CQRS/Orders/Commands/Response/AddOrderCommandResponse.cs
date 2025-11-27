namespace Application.CQRS.Orders.Commands.Response;

public class AddOrderCommandResponse
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
}
