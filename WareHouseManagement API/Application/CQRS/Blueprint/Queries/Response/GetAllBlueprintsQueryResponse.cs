namespace Application.CQRS.Blueprints.Queries.Response;

public class GetAllBlueprintsQueryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public int GridSize { get; set; }
    public int RackCount { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
}