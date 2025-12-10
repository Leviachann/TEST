using Domain.Enums;

namespace Application.CQRS.Users.Commands.Request;

public class UpdateUserCommandRequest
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string? Password { get; set; } 
    public UserRole Role { get; set; }
}