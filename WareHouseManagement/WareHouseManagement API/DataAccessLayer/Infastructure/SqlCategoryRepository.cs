using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;

namespace DataAccessLayer.Infastructure;

public class SqlCategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public SqlCategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
    }


    public async Task<Category?> GetByIdAsync(Guid id)
    {
        return await _context.Categories.FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }

    public Task<IQueryable<Category>> GetAllAsync()
    {
        return Task.Run(() =>
        {
            return _context.Categories.AsNoTracking().OrderByDescending(b => b.CreatedDate).Where(b => b.IsDeleted == false);
        });
    }

    public Task Update(Category category)
    {
        return Task.Run(() =>
        {
            category.UpdatedDate = DateTime.Now;
            _context.Categories.Update(category);
        });

    }

    public Task Remove(Guid id)
    {
        return Task.Run(async () =>
        {
            var currentCategory = await _context.Categories.FirstOrDefaultAsync(b => b.Id == id);
            currentCategory.IsDeleted = true;
            currentCategory.DeletedDate = DateTime.Now;
        });

    }

}
