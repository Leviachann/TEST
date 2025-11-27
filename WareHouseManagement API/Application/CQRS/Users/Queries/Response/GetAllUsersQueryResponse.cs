using Domain.Enums;

namespace Application.CQRS.Users.Queries.Response;

public class GetAllUsersQueryResponse
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedDate { get; set; }
}