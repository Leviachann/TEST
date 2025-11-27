using Application.CQRS.Suppliers.Commands.Request;
using Application.CQRS.Suppliers.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Suppliers.Handlers.CommandHandler;

public class DeleteSupplierCommandHandler 
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteSupplierCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<DeleteSupplierCommandResponse> Handle(DeleteSupplierCommandRequest request, CancellationToken cancellationToken)
    {
        var supplier = _mapper.Map<Supplier>(request);

        await _unitOfWork.SupplierRepository.Remove(supplier.Id);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<DeleteSupplierCommandResponse>(supplier);
    }
}
