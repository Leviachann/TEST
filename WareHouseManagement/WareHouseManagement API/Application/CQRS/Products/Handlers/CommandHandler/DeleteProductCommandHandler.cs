using Application.CQRS.Products.Commands.Request;
using Application.CQRS.Products.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Products.Handlers.CommandHandler;

public class DeleteProductCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeleteProductCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<DeleteProductCommandResponse> Handle(DeleteProductCommandRequest request, CancellationToken cancellationToken)
    {
        var product = _mapper.Map<Product>(request);

        await _unitOfWork.ProductRepository.Remove(product.Id);
        await _unitOfWork.SaveChangeAsync();

        return _mapper.Map<DeleteProductCommandResponse>(product);
    }
}
