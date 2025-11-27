namespace Application.CQRS.Auth.Requests;

public class LoginRequest
{
    public string UserName { get; set; }
    public string Password { get; set; }
}