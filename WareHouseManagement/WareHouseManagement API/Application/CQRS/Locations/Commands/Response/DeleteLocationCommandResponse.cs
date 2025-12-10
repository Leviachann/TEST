namespace Application.CQRS.Locations.Commands.Response;

public class DeleteLocationCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}
