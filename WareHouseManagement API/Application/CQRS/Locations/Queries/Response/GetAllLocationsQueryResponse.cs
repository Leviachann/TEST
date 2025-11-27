namespace Application.CQRS.Locations.Queries.Response;

public class GetAllLocationsQueryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public int Row { get; set; }
    public int Grid { get; set; }
    public string Zone { get; set; }
    public int Capacity { get; set; }
    public string XCoordinates { get; set; }
    public string YCoordinates { get; set; }
    public string ZCoordinates { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }

    public Guid? RackId { get; set; }
    public int? RowNumber { get; set; }
    public int? GridNumber { get; set; }
    public RackBasicInfo Rack { get; set; }
}

public class RackBasicInfo
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public Guid BlueprintId { get; set; }
}