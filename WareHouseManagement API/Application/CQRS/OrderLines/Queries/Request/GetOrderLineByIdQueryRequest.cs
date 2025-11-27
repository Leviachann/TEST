namespace Application.CQRS.OrderLines.Queries.Request;

public class GetOrderLineByIdQueryRequest
{
    public Guid Id { get; set; }
}
