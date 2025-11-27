using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infastructure;

public class SqlRefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _context;

    public SqlRefreshTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RefreshToken refreshToken)
    {
        await _context.RefreshTokens.AddAsync(refreshToken);
    }

    public async Task<RefreshToken?> GetByIdAsync(Guid id)
    {
        return await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Id == id && rt.IsDeleted == false);
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token && rt.IsDeleted == false);
    }

    public async Task<RefreshToken?> GetActiveTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt =>
                rt.Token == token &&
                !rt.IsRevoked &&
                !rt.IsUsed &&
                rt.ExpiresAt > DateTime.UtcNow &&
                rt.IsDeleted == false);
    }

    public Task<IQueryable<RefreshToken>> GetAllAsync()
    {
        return Task.Run(() =>
        {
            return _context.RefreshTokens
                .Include(rt => rt.User)
                .AsNoTracking()
                .OrderByDescending(rt => rt.CreatedDate)
                .Where(rt => rt.IsDeleted == false);
        });
    }

    public Task<IQueryable<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId)
    {
        return Task.Run(() =>
        {
            return _context.RefreshTokens
                .Where(rt =>
                    rt.UserId == userId &&
                    !rt.IsRevoked &&
                    !rt.IsUsed &&
                    rt.ExpiresAt > DateTime.UtcNow &&
                    rt.IsDeleted == false)
                .AsQueryable();
        });
    }

    public Task Update(RefreshToken refreshToken)
    {
        return Task.Run(() =>
        {
            refreshToken.UpdatedDate = DateTime.UtcNow;
            _context.RefreshTokens.Update(refreshToken);
        });
    }

    public Task RevokeAllUserTokensAsync(Guid userId)
    {
        return Task.Run(async () =>
        {
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked && rt.IsDeleted == false)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.IsRevoked = true;
                token.UpdatedDate = DateTime.UtcNow;
            }
        });
    }
}