using Application.CQRS.Products.Commands.Request;
using Application.CQRS.Products.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Products.Handlers.CommandHandler;

public class AddProductCommandHandler 
{

    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddProductCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<AddProductCommandResponse> Handle(AddProductCommandRequest request, CancellationToken cancellationToken)
    {
        var product = _mapper.Map<Product>(request);

        await _unitOfWork.ProductRepository.AddAsync(product);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<AddProductCommandResponse>(product);
    }
}
