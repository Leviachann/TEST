using Domain.Enums;

namespace Application.CQRS.Orders.Queries.Request;

public class FilterOrdersQueryRequest
{
    public Guid? SupplierId { get; set; }
    public DateTime? MinOrderDate { get; set; }
    public DateTime? MaxOrderDate { get; set; }
    public ArrivalStatus? Status { get; set; }
}
