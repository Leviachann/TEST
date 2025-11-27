using Domain.BaseEntities;
namespace Domain.Entities;

public class Inventory: BaseEntity
{
    public int CurrentStock { get; set; }  
    public int ReorderLevel { get; set; }  
    public int UnitsOnOrder { get; set; } 
    public DateTime? LastUpdated { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid LocationId { get; set; }  
    public Location? Location { get; set; } 

}
