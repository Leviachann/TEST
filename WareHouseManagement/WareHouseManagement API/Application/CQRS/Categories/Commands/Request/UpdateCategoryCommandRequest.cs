namespace Application.CQRS.Categories.Commands.Request;

public class UpdateCategoryCommandRequest 
{
    public Guid Id { get; set; }
    public string Name { get; set; }
}
