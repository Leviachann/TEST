namespace Application.CQRS.Suppliers.Queries.Request;

public class FilterSuppliersQueryRequest
{
    public string? Country { get; set; }
    public string? NameContains { get; set; }
    public string? EmailContains { get; set; }
}
