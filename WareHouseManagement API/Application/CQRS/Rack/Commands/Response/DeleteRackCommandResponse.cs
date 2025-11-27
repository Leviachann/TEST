namespace Application.CQRS.Racks.Commands.Response;

public class DeleteRackCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}