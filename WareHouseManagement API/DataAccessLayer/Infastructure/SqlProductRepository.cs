using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infastructure;

public class SqlProductRepository :IProductRepository
{
    private readonly AppDbContext _context;

    public SqlProductRepository(AppDbContext context)
    {
        _context = context;
    }
    private async Task CleanupOrphanedProducts()
    {
        var orphanedProducts = await _context.Products
            .Where(p => p.IsDeleted == false &&
                   ((p.Category != null && p.Category.IsDeleted == true) ||
                    (p.Supplier != null && p.Supplier.IsDeleted == true)))
            .ToListAsync();

        if (!orphanedProducts.Any())
            return;

        foreach (var product in orphanedProducts)
        {
            product.IsDeleted = true;
            product.DeletedDate = DateTime.Now;

            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.ProductId == product.Id && i.IsDeleted == false);

            if (inventory != null)
            {
                inventory.IsDeleted = true;
                inventory.DeletedDate = DateTime.Now;
            }

            var orderLines = await _context.OrderLines
                .Where(ol => ol.ProductId == product.Id && ol.IsDeleted == false)
                .ToListAsync();

            foreach (var orderLine in orderLines)
            {
                orderLine.IsDeleted = true;
                orderLine.DeletedDate = DateTime.Now;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task AddAsync(Product product)
    {
        await _context.Products.AddAsync(product);
    }

    public async Task<Product?> GetByIdAsync(Guid id)
    {
        await CleanupOrphanedProducts();

        return await _context.Products
            .Include(p => p.OrderLines)
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }

    public async Task<IQueryable<Product>> GetAllAsync()
    {
        await CleanupOrphanedProducts();

        return await Task.Run(() =>
        {
            return _context.Products
                .Include(p => p.OrderLines)
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .AsNoTracking()
                .OrderByDescending(b => b.CreatedDate)
                .Where(b => b.IsDeleted == false);
        });
    }

    public async Task<IQueryable<Product>> GetByCategory(Guid categoryId)
    {
        await CleanupOrphanedProducts();

        return await Task.Run(() =>
        {
            return _context.Products
                .Include(p => p.OrderLines)
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Where(p => p.CategoryId == categoryId && p.IsDeleted == false);
        });
    }

    public async Task<IQueryable<Product>> GetBySupplier(Guid supplierId)
    {
        await CleanupOrphanedProducts();

        return await Task.Run(() =>
        {
            return _context.Products
                .Include(p => p.OrderLines)
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Where(p => p.SupplierId == supplierId && p.IsDeleted == false);
        });
    }

    public Task Update(Product product)
    {
        return Task.Run(() =>
        {
            product.UpdatedDate = DateTime.Now;
            _context.Products.Update(product);
        });
    }

    public async Task Remove(Guid id)
    {
        var currentProduct = await _context.Products
            .FirstOrDefaultAsync(b => b.Id == id);

        if (currentProduct == null) return;

        currentProduct.IsDeleted = true;
        currentProduct.DeletedDate = DateTime.Now;

        var inventory = await _context.Inventories
            .FirstOrDefaultAsync(i => i.ProductId == id && i.IsDeleted == false);

        if (inventory != null)
        {
            inventory.IsDeleted = true;
            inventory.DeletedDate = DateTime.Now;
        }

        var orderLines = await _context.OrderLines
            .Where(ol => ol.ProductId == id && ol.IsDeleted == false)
            .ToListAsync();

        foreach (var orderLine in orderLines)
        {
            orderLine.IsDeleted = true;
            orderLine.DeletedDate = DateTime.Now;
        }
    }
}