namespace Application.CQRS.OrderLines.Commands.Request;

public class UpdateOrderLineCommandRequest
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public int QuantityOrdered { get; set; }
    public double PriceAtOrder { get; set; }
}
