namespace Application.CQRS.Categories.Commands.Response;
public class AddCategoryCommandResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedDate { get; set; }
}
