using Application.CQRS.Inventories.Commands.Request;
using Application.CQRS.Inventories.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Inventories.Handlers.CommandHandlers;

public class AddInventoryCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddInventoryCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<AddInventoriesCommandResponse> Handle(AddInventoriesCommandRequest request, CancellationToken cancellationToken)
    {
        var inventory = _mapper.Map<Inventory>(request);

        await _unitOfWork.InventoryRepository.AddAsync(inventory);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<AddInventoriesCommandResponse>(inventory);
    }
}
