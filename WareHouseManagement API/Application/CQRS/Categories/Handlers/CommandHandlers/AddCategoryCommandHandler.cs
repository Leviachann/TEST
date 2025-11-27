using Application.CQRS.Categories.Commands.Request;
using Application.CQRS.Categories.Commands.Response;
using AutoMapper;
using Domain.Entities;
using Repository.Common;

namespace Application.CQRS.Categories.Handlers.CommandHandlers
{
    public class AddCategoryCommandHandler
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AddCategoryCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<AddCategoryCommandResponse> Handle(AddCategoryCommandRequest request, CancellationToken cancellationToken)
        {
            var category = _mapper.Map<Category>(request);

            await _unitOfWork.CategoryRepository.AddAsync(category);
            await _unitOfWork.SaveChangeAsync();

            return _mapper.Map<AddCategoryCommandResponse>(category);
        }
    }
}
