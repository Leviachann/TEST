using Domain.Enums;

namespace Application.CQRS.Users.Commands.Response;

public class RegisterUserCommandResponse
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedDate { get; set; }
}