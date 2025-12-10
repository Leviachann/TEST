using Application.CQRS.Suppliers.Commands.Request;
using AutoMapper;
using MediatR;
using Repository.Common;

namespace Application.CQRS.Suppliers.Handlers.CommandHandler;

public class UpdateSupplierCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateSupplierCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<Unit> Handle(UpdateSupplierCommandRequest request, CancellationToken cancellationToken)
    {
        var supplier = await _unitOfWork.SupplierRepository.GetByIdAsync(request.Id);

        _mapper.Map(request, supplier);

        await _unitOfWork.SupplierRepository.Update(supplier);
        await _unitOfWork.SaveChangeAsync();

        return Unit.Value;
    }
}
