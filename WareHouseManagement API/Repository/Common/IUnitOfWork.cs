using Microsoft.EntityFrameworkCore.Storage;
using Repository.Repositories;

namespace Repository.Common
{
    public interface IUnitOfWork
    {
        IRackRepository RackRepository { get; }
        IBlueprintRepository BlueprintRepository { get; }
        IUserRepository UserRepository { get; }
        IProductRepository ProductRepository { get; }
        ICategoryRepository CategoryRepository { get; }
        IInventoryRepository InventoryRepository { get; }
        IOrderRepository OrderRepository { get; }
        IOrderLineRepository OrderLineRepository { get; }
        ILocationRepository LocationRepository { get; }
        ISupplierRepository SupplierRepository { get; }
        IRefreshTokenRepository RefreshTokenRepository { get; }

        Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
        bool HasActiveTransaction();
        Task SaveChangeAsync();
    }
}