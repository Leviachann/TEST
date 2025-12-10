using Domain.Entities;

namespace Repository.Repositories;

public interface IOrderRepository
{
    Task AddAsync(Order order);
    Task<Order?> GetByIdAsync(Guid id);
    Task<IQueryable<Order>> GetAllAsync();
    Task<IQueryable<Order>> GetOrdersBySupplier(Guid supplierId);
    Task Update(Order order);
    Task Remove(Guid id);
}