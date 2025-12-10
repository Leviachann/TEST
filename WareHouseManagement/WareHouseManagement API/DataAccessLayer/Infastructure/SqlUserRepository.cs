using DataAccessLayer.Context;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Repository.Repositories;
namespace DataAccessLayer.Infastructure;

public class SqlUserRepository : BaseSqlRepository, IUserRepository
{
    private readonly AppDbContext _context; 

    public SqlUserRepository(string connectionString, AppDbContext context) : base(connectionString)
    {
        _context = context;
    }

    public Task<IQueryable<User>> GetAllAsync()
    {
        return Task.Run(() =>
        {
            return _context.Users.AsNoTracking().OrderByDescending(b => b.CreatedDate).Where(b => b.IsDeleted == false);
        });
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted == false);
    }


    public async Task RegisterAsync(User user)
    {
        await EnsureEmailUniquety(user);

        await _context.AddAsync(user);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        return currentUser;
    }

    public Task Update(User user)
    {
        return Task.Run(() =>
        {
            user.UpdatedDate = DateTime.Now;
            _context.Users.Update(user);
        });

    }

    public Task Remove(Guid id)
    {
        return Task.Run(async () =>
        {
            var currentUser = await _context.Users.FirstOrDefaultAsync(b => b.Id == id);
            currentUser.IsDeleted = true;
            currentUser.DeletedDate = DateTime.Now;
        });

    }
    private async Task EnsureEmailUniquety(User user)
    {
        var dbUser = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Email == user.Email && x.IsDeleted == false && x.Id != user.Id);

        if (dbUser is not null)
            throw new Exception("Email already registered");
    }

}
