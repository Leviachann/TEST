namespace Application.CQRS.OrderLines.Queries.Request;

public class FilterOrderLinesQueryRequest
{
    public Guid? OrderId { get; set; }
    public Guid? ProductId { get; set; }
    public int? MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
}
