using Application.CQRS.Categories.Commands.Request;
using AutoMapper;
using MediatR;
using Repository.Common;

namespace Application.CQRS.Categories.Handlers.CommandHandlers;

public class UpdateCategoryCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateCategoryCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Unit> Handle(UpdateCategoryCommandRequest request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(request.Id);

        _mapper.Map(request, category);

        await _unitOfWork.CategoryRepository.Update(category);
        await _unitOfWork.SaveChangeAsync();

        return Unit.Value;
    }
}
