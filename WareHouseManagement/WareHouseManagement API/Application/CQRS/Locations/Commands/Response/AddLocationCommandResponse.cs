namespace Application.CQRS.Locations.Commands.Response;

public class AddLocationCommandResponse
{
    public Guid Id { get; set; }
    public DateTime CreatedDate { get; set; }
}
