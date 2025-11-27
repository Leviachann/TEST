namespace Application.CQRS.Users.Queries.Request;

public class GetMeQueryRequest
{
    public Guid UserId { get; set; }
}