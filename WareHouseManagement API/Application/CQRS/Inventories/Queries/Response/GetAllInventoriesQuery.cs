namespace Application.CQRS.Inventories.Query.Response;
public class GetAllInventoriesQueryResponse 
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public Guid LocationId { get; set; }
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public int UnitsOnOrder { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public bool IsDeleted { get; set; }
}