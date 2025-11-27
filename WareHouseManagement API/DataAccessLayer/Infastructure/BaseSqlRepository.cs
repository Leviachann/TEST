namespace DataAccessLayer.Infastructure;

public abstract class BaseSqlRepository
{
    private readonly string _connectionString;
    internal BaseSqlRepository(string connectionString)
    {
        _connectionString = connectionString;
    }
}
