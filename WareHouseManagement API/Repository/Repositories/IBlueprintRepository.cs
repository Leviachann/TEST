using Domain.Entities;

namespace Repository.Repositories;

public interface IBlueprintRepository
{
    Task AddAsync(Blueprint blueprint);
    Task<Blueprint?> GetByIdAsync(Guid id);
    Task<IQueryable<Blueprint>> GetAllAsync();
    Task Update(Blueprint blueprint);
    Task Remove(Guid id);
}
