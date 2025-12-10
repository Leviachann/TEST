using DataAccessLayer.Context;
using DataAccessLayer.Infastructure;
using DataAccessLayer.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Repository.Common;
using Repository.Repositories;

namespace DataAccessLayer.UnitOfWork
{
    public class SqlUnitOfWork : IUnitOfWork
    {
        private readonly string _connectionString;
        private readonly AppDbContext _context;
        private IDbContextTransaction? _currentTransaction;

        private SqlUserRepository _userRepository;
        private SqlCategoryRepository _categoryRepository;
        private SqlProductRepository _productRepository;
        private SqlInventoryRepository _inventoryRepository;
        private SqlSupplierRepository _supplierRepository;
        private SqlOrderRepository _orderRepository;
        private SqlOrderLineRepository _orderLineRepository;
        private SqlLocationRepository _locationRepository;
        private SqlRefreshTokenRepository _refreshTokenRepository;
        private SqlBlueprintRepository _blueprintRepository;
        private SqlRackRepository _rackRepository;
        public SqlUnitOfWork(string connectionString, AppDbContext context)
        {
            _connectionString = connectionString;
            _context = context;
        }

        public IUserRepository UserRepository =>
            _userRepository ??= new SqlUserRepository(_connectionString, _context);


        public IBlueprintRepository BlueprintRepository=>
          _blueprintRepository ??=  new SqlBlueprintRepository(_context);
        public IRackRepository RackRepository =>
           _rackRepository ??= new SqlRackRepository(_context);

        public ICategoryRepository CategoryRepository =>
            _categoryRepository ??= new SqlCategoryRepository(_context);

        public IProductRepository ProductRepository =>
            _productRepository ??= new SqlProductRepository(_context);

        public IInventoryRepository InventoryRepository =>
            _inventoryRepository ??= new SqlInventoryRepository(_context);

        public ISupplierRepository SupplierRepository =>
            _supplierRepository ??= new SqlSupplierRepository(_context);

        public IOrderRepository OrderRepository =>
            _orderRepository ??= new SqlOrderRepository(_context);

        public IOrderLineRepository OrderLineRepository =>
            _orderLineRepository ??= new SqlOrderLineRepository(_context);

        public ILocationRepository LocationRepository =>
            _locationRepository ??= new SqlLocationRepository(_context);

        public IRefreshTokenRepository RefreshTokenRepository =>
            _refreshTokenRepository ??= new SqlRefreshTokenRepository(_context);

        public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_currentTransaction != null)
            {
                return _currentTransaction;
            }

            _currentTransaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            return _currentTransaction;
        }

        public bool HasActiveTransaction()
        {
            return _currentTransaction != null;
        }

        public async Task SaveChangeAsync()
        {
            await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _currentTransaction?.Dispose();
            _context?.Dispose();
        }
    }
}