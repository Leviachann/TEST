namespace Application.CQRS.OrderLines.Queries.Request
{
    public class GetOrderLinesByOrderQueryRequest
    {
        public Guid OrderId { get; set; }
    }
}
