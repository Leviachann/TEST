using Application.CQRS.Blueprints.Commands.Request;
using Application.CQRS.Blueprints.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Blueprints.Handlers.CommandHandler;

public class DeleteBlueprintCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteBlueprintCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DeleteBlueprintCommandResponse> Handle(DeleteBlueprintCommandRequest request, CancellationToken cancellationToken)
    {
        var blueprint = _mapper.Map<Blueprint>(request);
        await _unitOfWork.BlueprintRepository.Remove(blueprint.Id);
        await _unitOfWork.SaveChangeAsync();
        return _mapper.Map<DeleteBlueprintCommandResponse>(blueprint);
    }
}