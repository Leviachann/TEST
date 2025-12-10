using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infrastructure;

public class SqlBlueprintRepository : IBlueprintRepository
{
    private readonly AppDbContext _context;

    public SqlBlueprintRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Blueprint blueprint)
    {
        await _context.Blueprints.AddAsync(blueprint);
    }

    public async Task<Blueprint> GetByIdAsync(Guid id)
    {
        return await _context.Blueprints
            .Include(b => b.Racks)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }

    public Task<IQueryable<Blueprint>> GetAllAsync()
    {
        return Task.Run(() =>
        {
            return _context.Blueprints
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedDate)
                .Where(b => b.IsDeleted == false);
        });
    }

    public Task Update(Blueprint blueprint)
    {
        return Task.Run(() =>
        {
            blueprint.UpdatedDate = DateTime.Now;
            _context.Blueprints.Update(blueprint);
        });
    }

    public async Task Remove(Guid id)
    {
        var currentBlueprint = await _context.Blueprints
            .FirstOrDefaultAsync(b => b.Id == id);

        if (currentBlueprint == null) return;

        currentBlueprint.IsDeleted = true;
        currentBlueprint.DeletedDate = DateTime.Now;

        var racks = await _context.Racks
            .Where(r => r.BlueprintId == id && r.IsDeleted == false)
            .ToListAsync();

        foreach (var rack in racks)
        {
            rack.IsDeleted = true;
            rack.DeletedDate = DateTime.Now;
        }
    }
}