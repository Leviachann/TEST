using Domain.Entities;

namespace Repository.Repositories;

public interface ILocationRepository
{
    Task AddAsync(Location location);
    Task<Location> GetByIdAsync(Guid id);
    Task<IQueryable<Location>> GetAllAsync();
    Task Update(Location location);
    Task Remove(Guid id); 
}
