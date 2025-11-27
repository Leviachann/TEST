namespace Application.CQRS.Blueprints.Commands.Response;

public class AddBlueprintCommandResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedDate { get; set; }
}