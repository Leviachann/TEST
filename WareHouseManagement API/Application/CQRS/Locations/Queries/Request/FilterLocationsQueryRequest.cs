namespace Application.CQRS.Locations.Queries.Request;

public class FilterLocationsQueryRequest 
{
    public string? Zone { get; set; }
    public int? Row { get; set; }
    public int? Grid { get; set; }
    public int? MinCapacity { get; set; }
    public int? MaxCapacity { get; set; }
}
