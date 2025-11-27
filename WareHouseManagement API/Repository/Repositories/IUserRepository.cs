using Domain.Entities;

namespace Repository.Repositories;

public interface IUserRepository
{
    Task RegisterAsync(User user);
    Task<User?> GetByIdAsync(Guid id);
    Task<IQueryable<User>> GetAllAsync();
    Task<User?> GetUserByEmailAsync(string email);
    Task Update(User user);
    Task Remove(Guid id); 
}
