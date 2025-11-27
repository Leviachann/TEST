namespace Application.CQRS.OrderLines.Commands.Response;

public class AddOrderLineCommandResponse
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
}
