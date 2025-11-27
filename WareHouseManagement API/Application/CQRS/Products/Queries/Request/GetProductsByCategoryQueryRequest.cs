namespace Application.CQRS.Products.Queries.Request;

public class GetProductsByCategoryQueryRequest
{
    public Guid CategoryId { get; set; }
}
