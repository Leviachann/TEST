namespace Common.ErrorResponses;

public class ErrorResponseList<T> : ErrorResponse
{
    private List<T> _data = new();
    public int TotalCount => _data.Count;

    public List<T> Data
    {
        get => _data;
        set => _data = value ?? new List<T>();
    }

    public ErrorResponseList(List<string> errors) : base(errors) { }
    public ErrorResponseList() { }
}
