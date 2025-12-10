namespace Application.CQRS.Blueprints.Commands.Request;

public class AddBlueprintCommandRequest
{
    public string Name { get; set; }
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    public int GridSize { get; set; } = 100;
}