namespace Application.CQRS.Suppliers.Commands.Response;

public class AddSupplierCommandResponse
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
}
