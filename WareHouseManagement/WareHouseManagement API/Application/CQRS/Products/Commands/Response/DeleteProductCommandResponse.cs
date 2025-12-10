namespace Application.CQRS.Products.Commands.Response;

public class DeleteProductCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}
