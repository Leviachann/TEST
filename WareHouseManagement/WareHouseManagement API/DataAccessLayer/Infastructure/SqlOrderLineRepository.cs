using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infastructure;

public class SqlOrderLineRepository : IOrderLineRepository
{
    private readonly AppDbContext _context;

    public SqlOrderLineRepository(AppDbContext context)
    {
        _context = context;
    }

    private async Task CleanupOrphanedOrderLines()
    {
        var orphanedOrderLines = await _context.OrderLines
            .Where(ol => ol.IsDeleted == false &&
                   ((ol.Order != null && ol.Order.IsDeleted == true) ||
                    (ol.Product != null && ol.Product.IsDeleted == true)))
            .ToListAsync();

        if (!orphanedOrderLines.Any())
            return;

        foreach (var orderLine in orphanedOrderLines)
        {
            orderLine.IsDeleted = true;
            orderLine.DeletedDate = DateTime.Now;
        }

        await _context.SaveChangesAsync();
    }

    public async Task AddAsync(OrderLine orderLine)
    {
        await _context.OrderLines.AddAsync(orderLine);
    }

    public async Task<OrderLine?> GetByIdAsync(Guid id)
    {
        await CleanupOrphanedOrderLines();

        return await _context.OrderLines
            .Include(ol => ol.Order)
            .Include(ol => ol.Product)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }

    public async Task<IQueryable<OrderLine>> GetAllAsync()
    {
        await CleanupOrphanedOrderLines();

        return await Task.Run(() =>
        {
            return _context.OrderLines
                .Include(ol => ol.Order)
                .Include(ol => ol.Product)
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedDate)
                .Where(b => b.IsDeleted == false);
        });
    }

    public async Task<IQueryable<OrderLine>> GetByOrder(Guid orderId)
    {
        await CleanupOrphanedOrderLines();

        return await Task.Run(() =>
        {
            return _context.OrderLines
                .Include(ol => ol.Product)
                .Include(ol => ol.Order)
                .Where(ol => ol.OrderId == orderId && ol.IsDeleted == false);
        });
    }

    public Task Update(OrderLine orderLine)
    {
        return Task.Run(() =>
        {
            orderLine.UpdatedDate = DateTime.Now;
            _context.OrderLines.Update(orderLine);
        });
    }

    public async Task Remove(Guid id)
    {
        var currentOrderLine = await _context.OrderLines.FirstOrDefaultAsync(b => b.Id == id);

        if (currentOrderLine == null) return;

        currentOrderLine.IsDeleted = true;
        currentOrderLine.DeletedDate = DateTime.Now;
    }
}