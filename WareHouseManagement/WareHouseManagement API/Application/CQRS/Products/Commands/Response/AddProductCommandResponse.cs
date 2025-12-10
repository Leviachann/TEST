namespace Application.CQRS.Products.Commands.Response;

public class AddProductCommandResponse
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
}
