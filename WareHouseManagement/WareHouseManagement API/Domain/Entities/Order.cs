using Domain.BaseEntities;
using Domain.Enums;

namespace Domain.Entities;

public class Order:BaseEntity
{
    public DateTime? OrderDate { get; set; }
    public DateTime? ArrivalTime { get; set; }
    public ArrivalStatus OrderArrivalStatus { get; set; }
    public Guid SupplierId { get; set; }  
    public Supplier? Supplier { get; set; }
    public ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();

}
