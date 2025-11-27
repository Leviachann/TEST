namespace Application.CQRS.OrderLines.Commands.Request;

public class AddOrderLineCommandRequest 
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public int QuantityOrdered { get; set; }
    public double PriceAtOrder { get; set; }
}
