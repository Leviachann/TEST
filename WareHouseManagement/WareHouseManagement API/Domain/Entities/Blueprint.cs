using Domain.BaseEntities;

namespace Domain.Entities;

public class Blueprint : BaseEntity
{
    public string Name { get; set; }
    public decimal Width { get; set; } 
    public decimal Height { get; set; } 
    public int GridSize { get; set; }   
    public ICollection<Rack> Racks { get; set; }
}