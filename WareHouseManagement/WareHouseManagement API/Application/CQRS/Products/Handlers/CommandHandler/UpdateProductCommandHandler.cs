using Application.CQRS.Products.Commands.Request;
using AutoMapper;
using MediatR;
using Repository.Common;

namespace Application.CQRS.Products.Handlers.CommandHandler;

public class UpdateProductCommandHandler
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateProductCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Unit> Handle(UpdateProductCommandRequest request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.ProductRepository.GetByIdAsync(request.Id);

        _mapper.Map(request, product);

        await _unitOfWork.ProductRepository.Update(product);
        await _unitOfWork.SaveChangeAsync();

        return Unit.Value;
    }
}
