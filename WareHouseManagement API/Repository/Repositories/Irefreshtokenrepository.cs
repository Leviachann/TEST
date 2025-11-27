using Domain.Entities;

namespace Repository.Repositories;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken refreshToken);
    Task<RefreshToken?> GetByIdAsync(Guid id);
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<RefreshToken?> GetActiveTokenAsync(string token);
    Task<IQueryable<RefreshToken>> GetAllAsync();
    Task<IQueryable<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId);
    Task Update(RefreshToken refreshToken);
    Task RevokeAllUserTokensAsync(Guid userId);
}