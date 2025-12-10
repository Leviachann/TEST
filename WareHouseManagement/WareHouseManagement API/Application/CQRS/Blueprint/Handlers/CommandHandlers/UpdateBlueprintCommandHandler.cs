using Application.CQRS.Blueprints.Commands.Request;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Blueprints.Handlers.CommandHandler;

public class UpdateBlueprintCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateBlueprintCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task Handle(UpdateBlueprintCommandRequest request, CancellationToken cancellationToken)
    {
        var blueprint = await _unitOfWork.BlueprintRepository.GetByIdAsync(request.Id);
        _mapper.Map(request, blueprint);
        await _unitOfWork.BlueprintRepository.Update(blueprint);
        await _unitOfWork.SaveChangeAsync();
    }
}