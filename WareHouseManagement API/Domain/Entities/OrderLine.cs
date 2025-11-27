using Domain.BaseEntities;
namespace Domain.Entities;

public class OrderLine : BaseEntity
{
    public int QuantityOrdered { get; set; }
    public double PriceAtOrder { get; set; }
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

}
