using Domain.Enums;

namespace Application.CQRS.Users.Commands.Request;

public class RegisterUserCommandRequest
{
    public string UserName { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public UserRole Role { get; set; }
}