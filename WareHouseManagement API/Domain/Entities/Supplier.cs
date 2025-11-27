using Domain.BaseEntities;

namespace Domain.Entities;

public class Supplier:BaseEntity
{
    public string Country { get; set; }
    public string Adress { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();

}
