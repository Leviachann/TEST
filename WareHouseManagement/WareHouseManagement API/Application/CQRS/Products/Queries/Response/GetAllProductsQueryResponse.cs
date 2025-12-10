namespace Application.CQRS.Products.Queries.Response;

public class GetAllProductsQueryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string SKU { get; set; }
    public double Price { get; set; }
    public double SalePrice { get; set; }
    public double Height { get; set; }
    public double Width { get; set; }
    public double Length { get; set; }
    public double Weight { get; set; }
    public string CountryOfOrigin { get; set; }
    public DateTime ProductionDate { get; set; }
    public DateTime ExpirationDate { get; set; }
    public Guid CategoryId { get; set; }
    public Guid SupplierId { get; set; }
    public List<Guid> OrderLineIds { get; set; }
    public int Stock { get; set; }
}
