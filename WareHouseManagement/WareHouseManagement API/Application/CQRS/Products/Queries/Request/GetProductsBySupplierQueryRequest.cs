namespace Application.CQRS.Products.Queries.Request;

public class GetProductsBySupplierQueryRequest
{
    public Guid SupplierId { get; set; }
}
 