namespace Application.CQRS.Products.Queries.Request;

public class FilterProductsQueryRequest
{
    public Guid? CategoryId { get; set; }
    public Guid? SupplierId { get; set; }
    public double? MinPrice { get; set; }
    public double? MaxPrice { get; set; }
    public bool? InStockOnly { get; set; }
    public string? NameContains { get; set; }
    public string? SkuContains { get; set; }
}
