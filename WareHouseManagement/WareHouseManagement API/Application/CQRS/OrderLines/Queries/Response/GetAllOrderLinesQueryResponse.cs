namespace Application.CQRS.OrderLines.Queries.Response;

public class GetAllOrderLinesQueryResponse
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public int QuantityOrdered { get; set; }
    public double PriceAtOrder { get; set; }
}
