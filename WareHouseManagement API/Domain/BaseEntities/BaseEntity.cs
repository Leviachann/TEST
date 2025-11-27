namespace Domain.BaseEntities;

public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public string? Name { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedDate { get; set; }

    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }

    protected BaseEntity()
    {
        CreatedDate = DateTime.UtcNow; 
    }
}
