using Application.CQRS.Suppliers.Queries.Request;
using Application.CQRS.Suppliers.Queries.Response;
using AutoMapper;
using Repository.Common;

namespace Application.CQRS.Suppliers.Handlers.QueryHandler;

public class GetSupplierByIdQueryHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetSupplierByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<GetSupplierByIdQueryResponse?> Handle(GetSupplierByIdQueryRequest request, CancellationToken cancellationToken)
    {
        var supplier = await _unitOfWork.SupplierRepository.GetByIdAsync(request.Id);

        if (supplier == null)
            return null;

        return _mapper.Map<GetSupplierByIdQueryResponse>(supplier);
    }
}