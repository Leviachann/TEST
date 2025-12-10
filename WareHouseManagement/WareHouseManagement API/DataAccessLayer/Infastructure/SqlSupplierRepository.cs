using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infastructure;

public class SqlSupplierRepository : ISupplierRepository
{
    private readonly AppDbContext _context;

    public SqlSupplierRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Supplier supplier)
    {
        await _context.Suppliers.AddAsync(supplier);
    }

    public async Task<Supplier?> GetByIdAsync(Guid id)
    {
        return await _context.Suppliers.FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }

    public Task<IQueryable<Supplier>> GetAllAsync()
    {
        return Task.Run(() =>
        {
            return _context.Suppliers.Include(s => s.Products)
            .Include(s => s.Orders).AsNoTracking().OrderByDescending(b => b.CreatedDate).Where(b => b.IsDeleted == false);
        });
    }

    public IQueryable<Supplier> GetSuppliersWithProducts()
    {
        return _context.Suppliers.Include(s => s.Products)
            .Include(s => s.Orders)
            .Where(s => s.IsDeleted == false)
            .Include(s => s.Products);
    }

    public Task Update(Supplier supplier)
    {
        return Task.Run(() =>
        {
            supplier.UpdatedDate = DateTime.Now;
            _context.Suppliers.Update(supplier);
        });

    }
    public Task Remove(Guid id)
    {
        return Task.Run(async () =>
        {
            var currentSupplier = await _context.Suppliers.FirstOrDefaultAsync(b => b.Id == id);
            currentSupplier.IsDeleted = true;
            currentSupplier.DeletedDate = DateTime.Now;
        });

    }
}
