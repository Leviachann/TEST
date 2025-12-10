using Application.CQRS.Inventories.Commands.Request;
using AutoMapper;
using MediatR;
using Repository.Common;

namespace Application.CQRS.Categories.Handlers.CommandHandlers;

public class UpdateInventoriesCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateInventoriesCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<Unit> Handle(UpdateInventoriesCommandRequest request, CancellationToken cancellationToken)
    {

        var inventory = await _unitOfWork.InventoryRepository.GetByIdAsync(request.Id);

        _mapper.Map(request, inventory);

        await _unitOfWork.InventoryRepository.Update(inventory);
        await _unitOfWork.SaveChangeAsync();

        return Unit.Value;
    }
}
