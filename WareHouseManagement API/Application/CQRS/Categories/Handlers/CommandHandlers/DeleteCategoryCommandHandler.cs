using Application.CQRS.Categories.Commands.Request;
using Application.CQRS.Categories.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Categories.Handlers;
public class DeleteCategoryCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteCategoryCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<DeleteCategoryCommandResponse> Handle(DeleteCategoryCommandRequest request, CancellationToken cancellationToken)
    {
        var category = _mapper.Map<Category>(request);

        await _unitOfWork.CategoryRepository.Remove(category.Id);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<DeleteCategoryCommandResponse>(category);
    }
}
