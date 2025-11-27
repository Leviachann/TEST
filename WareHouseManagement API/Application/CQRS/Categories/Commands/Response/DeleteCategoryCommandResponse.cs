using MediatR;

namespace Application.CQRS.Categories.Commands.Response;

public class DeleteCategoryCommandResponse : IRequest<Unit>
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }
}
