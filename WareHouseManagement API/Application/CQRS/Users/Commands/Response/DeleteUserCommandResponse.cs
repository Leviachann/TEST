namespace Application.CQRS.Users.Commands.Response;

public class DeleteUserCommandResponse
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}