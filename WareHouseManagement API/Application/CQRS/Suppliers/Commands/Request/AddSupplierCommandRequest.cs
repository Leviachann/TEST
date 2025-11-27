namespace Application.CQRS.Suppliers.Commands.Request;

public class AddSupplierCommandRequest
{
    public string Name { get; set; }
    public string Country { get; set; }
    public string Adress { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public List<Guid> ProductIds { get; set; }
    public List<Guid> OrdersIds { get; set; }
}
