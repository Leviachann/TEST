using MediatR;

namespace Application.CQRS.Users.Commands;

public class DeleteUserCommandRequest : IRequest<bool>
{
    public Guid Id { get; set; }
}
