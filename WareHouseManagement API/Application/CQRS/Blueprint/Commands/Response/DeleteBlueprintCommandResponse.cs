namespace Application.CQRS.Blueprints.Commands.Response;

public class DeleteBlueprintCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}