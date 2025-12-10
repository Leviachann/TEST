using Domain.Entities;

namespace Repository.Repositories;

public interface IRackRepository
{
    Task AddAsync(Rack rack);
    Task<Rack> GetByIdAsync(Guid id);
    Task<IQueryable<Rack>> GetAllAsync();
    Task<IQueryable<Rack>> GetByBlueprintIdAsync(Guid blueprintId);
    Task Update(Rack rack);
    Task Remove(Guid id);
}