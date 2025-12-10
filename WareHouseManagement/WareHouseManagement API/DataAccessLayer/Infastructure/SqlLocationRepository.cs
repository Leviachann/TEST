using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infastructure;

public class SqlLocationRepository : ILocationRepository
{
    private readonly AppDbContext _context;

    public SqlLocationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Location location)
    {
        await _context.Locations.AddAsync(location);
    }

    public async Task<Location> GetByIdAsync(Guid id)
    {
        return await _context.Locations
            .FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }

    public Task<IQueryable<Location>> GetAllAsync()
    {
        return Task.Run(() =>
        {
            return _context.Locations
                .Include(l => l.Rack) // ADD THIS
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedDate)
                .Where(b => b.IsDeleted == false);
        });
    }

    public Task Update(Location location)
    {
        return Task.Run(() =>
        {
            location.UpdatedDate = DateTime.Now;
            _context.Locations.Update(location);
        });
    }

    public async Task Remove(Guid id)
    {
        var currentLocation = await _context.Locations
            .FirstOrDefaultAsync(b => b.Id == id);

        if (currentLocation == null) return;

        currentLocation.IsDeleted = true;
        currentLocation.DeletedDate = DateTime.Now;

        var inventory = await _context.Inventories
            .FirstOrDefaultAsync(i => i.LocationId == id && i.IsDeleted == false);

        if (inventory != null)
        {
            inventory.IsDeleted = true;
            inventory.DeletedDate = DateTime.Now;
        }
    }
}