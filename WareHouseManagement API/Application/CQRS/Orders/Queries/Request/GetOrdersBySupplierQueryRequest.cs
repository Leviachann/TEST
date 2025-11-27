namespace Application.CQRS.Orders.Queries.Request
{
    public class GetOrdersBySupplierQueryRequest
    {
        public Guid SupplierId { get; set; }
    }
}
