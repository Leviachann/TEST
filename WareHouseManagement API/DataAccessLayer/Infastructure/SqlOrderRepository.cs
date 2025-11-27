using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infastructure;

public class SqlOrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public SqlOrderRepository(AppDbContext context)
    {
        _context = context;
    }

    private async Task CleanupOrphanedOrders()
    {
        var orphanedOrders = await _context.Orders
            .Where(o => o.IsDeleted == false &&
                   (o.Supplier != null && o.Supplier.IsDeleted == true))
            .ToListAsync();

        if (!orphanedOrders.Any())
            return;

        foreach (var order in orphanedOrders)
        {
            order.IsDeleted = true;
            order.DeletedDate = DateTime.Now;

            var orderLines = await _context.OrderLines
                .Where(ol => ol.OrderId == order.Id && ol.IsDeleted == false)
                .ToListAsync();

            foreach (var orderLine in orderLines)
            {
                orderLine.IsDeleted = true;
                orderLine.DeletedDate = DateTime.Now;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task AddAsync(Order order)
    {
        await _context.Orders.AddAsync(order);
    }

    public async Task<Order?> GetByIdAsync(Guid id)
    {
        await CleanupOrphanedOrders();

        return await _context.Orders
            .Include(o => o.OrderLines)
            .Include(o => o.Supplier)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }

    public async Task<IQueryable<Order>> GetAllAsync()
    {
        await CleanupOrphanedOrders();

        return await Task.Run(() =>
        {
            return _context.Orders
                .Include(o => o.OrderLines)
                .Include(o => o.Supplier)
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedDate)
                .Where(b => b.IsDeleted == false);
        });
    }

    public async Task<IQueryable<Order>> GetOrdersBySupplier(Guid supplierId)
    {
        await CleanupOrphanedOrders();

        return await Task.Run(() =>
        {
            return _context.Orders
                .Include(ol => ol.Supplier)
                .Include(ol => ol.OrderLines)
                .Where(ol => ol.SupplierId == supplierId && ol.IsDeleted == false);
        });
    }

    public Task Update(Order order)
    {
        return Task.Run(() =>
        {
            order.UpdatedDate = DateTime.Now;
            _context.Orders.Update(order);
        });
    }

    public async Task Remove(Guid id)
    {
        var currentOrder = await _context.Orders
            .FirstOrDefaultAsync(b => b.Id == id);

        if (currentOrder == null) return;

        currentOrder.IsDeleted = true;
        currentOrder.DeletedDate = DateTime.Now;

        var orderLines = await _context.OrderLines
            .Where(ol => ol.OrderId == id && ol.IsDeleted == false)
            .ToListAsync();

        foreach (var orderLine in orderLines)
        {
            orderLine.IsDeleted = true;
            orderLine.DeletedDate = DateTime.Now;
        }
    }
}