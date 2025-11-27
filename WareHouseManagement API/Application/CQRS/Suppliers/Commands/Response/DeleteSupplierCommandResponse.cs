namespace Application.CQRS.Suppliers.Commands.Response;

public class DeleteSupplierCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}