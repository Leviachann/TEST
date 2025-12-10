namespace Application.CQRS.Locations.Queries.Response;

public class GetByIdLocationQueryResponse
{
    public string Name { get; set; }
    public int Row { get; set; }
    public int Grid { get; set; }
    public string Zone { get; set; }
    public int Capacity { get; set; }
    public string XCoordinates { get; set; }
    public string YCoordinates { get; set; }
    public string ZCoordinates { get; set; }
    public string Description { get; set; }
}
