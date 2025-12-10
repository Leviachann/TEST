using Domain.Entities;

namespace Repository.Repositories;

public interface ICategoryRepository
{
    Task AddAsync(Category category);
    Task<Category?> GetByIdAsync(Guid id);
    Task<IQueryable<Category>> GetAllAsync();
    Task Update(Category category);
    Task Remove(Guid id);
}
