using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infastructure;

public class SqlInventoryRepository : IInventoryRepository
{
    private readonly AppDbContext _context;

    public SqlInventoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Inventory inventory)
    {
        await _context.Inventories.AddAsync(inventory);
    }

    public async Task<Inventory?> GetByIdAsync(Guid id)
    {
        return await _context.Inventories.FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }

    public Task<IQueryable<Inventory>> GetAllAsync()
    {
        return Task.Run(() =>
        {
            return _context.Inventories.AsNoTracking().OrderByDescending(b => b.CreatedDate).Where(b => b.IsDeleted == false);
        });
    }

    public async Task<Inventory?> GetByProductId(Guid productId)
    {
        var inventory = await _context.Inventories
            .FirstOrDefaultAsync(i => i.ProductId == productId && i.IsDeleted == false);

        return inventory;
    }

    public Task Update(Inventory inventory)
    {
        return Task.Run(() =>
        {
            inventory.UpdatedDate = DateTime.Now;
            _context.Inventories.Update(inventory);
        });

    }

    public Task Remove(Guid id)
    {
        return Task.Run(async () =>
        {
            var currentInventory = await _context.Inventories.FirstOrDefaultAsync(b => b.Id == id);
            currentInventory.IsDeleted = true;
            currentInventory.DeletedDate = DateTime.Now;
        });

    }
}
