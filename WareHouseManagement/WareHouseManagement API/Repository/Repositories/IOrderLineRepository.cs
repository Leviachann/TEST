using Domain.Entities;

namespace Repository.Repositories;

public interface IOrderLineRepository
{
    Task AddAsync(OrderLine orderLine);
    Task<OrderLine?> GetByIdAsync(Guid id);
    Task<IQueryable<OrderLine>> GetAllAsync();
    Task<IQueryable<OrderLine>> GetByOrder(Guid orderId);
    Task Update(OrderLine orderLine);
    Task Remove(Guid id);
}