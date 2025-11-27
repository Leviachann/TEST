using Domain.Entities;

namespace Repository.Repositories;

public interface IInventoryRepository
{
    Task AddAsync(Inventory inventory);
    Task<Inventory?> GetByIdAsync(Guid id);
    Task<IQueryable<Inventory>> GetAllAsync();
    Task<Inventory?> GetByProductId(Guid productId);
    Task Update(Inventory inventory);
    Task Remove(Guid id); 
}
