using Application.CQRS.Inventories.Commands.Request;
using Application.CQRS.Inventories.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Categories.Handlers;
public class DeleteInventoriesCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteInventoriesCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DeleteInventoriesCommandResponse> Handle(DeleteInventoriesCommandRequest request, CancellationToken cancellationToken)
    {
        var inventory = _mapper.Map<Inventory>(request);

        await _unitOfWork.InventoryRepository.Remove(inventory.Id);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<DeleteInventoriesCommandResponse>(inventory);
    }
}
