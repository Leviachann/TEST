using Application.CQRS.Suppliers.Commands.Request;
using Application.CQRS.Suppliers.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Suppliers.Handlers.CommandHandler;

public class AddSupplierCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddSupplierCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }


    public async Task<AddSupplierCommandResponse> Handle(AddSupplierCommandRequest request, CancellationToken cancellationToken)
    {
        var supplier = _mapper.Map<Supplier>(request);

        await _unitOfWork.SupplierRepository.AddAsync(supplier);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<AddSupplierCommandResponse>(supplier);
    }
}
