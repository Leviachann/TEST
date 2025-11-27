using Domain.Entities;

namespace Repository.Repositories;

public interface ISupplierRepository
{
    Task AddAsync(Supplier supplier);
    Task<Supplier?> GetByIdAsync(Guid id);
    Task<IQueryable<Supplier>> GetAllAsync();
    Task Update(Supplier supplier);
    Task Remove(Guid id); 
}
