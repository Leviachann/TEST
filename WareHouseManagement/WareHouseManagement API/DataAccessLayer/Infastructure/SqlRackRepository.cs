using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infrastructure;

public class SqlRackRepository : IRackRepository
{
    private readonly AppDbContext _context;

    public SqlRackRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Rack rack)
    {
        await _context.Racks.AddAsync(rack);
    }

    public async Task<Rack> GetByIdAsync(Guid id)
    {
        return await _context.Racks
            .Include(r => r.Blueprint)
            .Include(r => r.Locations)
            .FirstOrDefaultAsync(r => r.Id == id && r.IsDeleted == false);
    }

    public Task<IQueryable<Rack>> GetAllAsync()
    {
        IQueryable<Rack> query = _context.Racks
            .AsNoTracking()
            .Include(r => r.Blueprint)
            .Where(r => r.IsDeleted == false)
            .OrderByDescending(r => r.CreatedDate);

        return Task.FromResult(query);
    }


    public Task<IQueryable<Rack>> GetByBlueprintIdAsync(Guid blueprintId)
    {
        IQueryable<Rack> query = _context.Racks
            .AsNoTracking()
            .Where(r => r.BlueprintId == blueprintId && r.IsDeleted == false)
            .OrderBy(r => r.Name);

        return Task.FromResult(query);
    }


    public Task Update(Rack rack)
    {
        return Task.Run(() =>
        {
            rack.UpdatedDate = DateTime.Now;
            _context.Racks.Update(rack);
        });
    }

    public async Task Remove(Guid id)
    {
        var currentRack = await _context.Racks
            .FirstOrDefaultAsync(r => r.Id == id);

        if (currentRack == null) return;

        currentRack.IsDeleted = true;
        currentRack.DeletedDate = DateTime.Now;

        var locations = await _context.Locations
            .Where(l => l.RackId == id && l.IsDeleted == false)
            .ToListAsync();

        foreach (var location in locations)
        {
            location.IsDeleted = true;
            location.DeletedDate = DateTime.Now;
        }
    }
}