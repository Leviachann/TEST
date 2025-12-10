using Domain.BaseEntities;
namespace Domain.Entities;

public class Product : BaseEntity
{
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
    public Category Category { get; set; }
    public Inventory Inventory { get; set; }
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; }
    public ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();

}
