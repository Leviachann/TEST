using Domain.Entities;

namespace Repository.Repositories;

public interface IProductRepository
{
    Task AddAsync(Product product);
    Task<Product?> GetByIdAsync(Guid id);
    Task<IQueryable<Product>> GetAllAsync();
    Task<IQueryable<Product>> GetByCategory(Guid categoryId);
    Task<IQueryable<Product>> GetBySupplier(Guid supplierId);
    Task Update(Product product);
    Task Remove(Guid id);
}