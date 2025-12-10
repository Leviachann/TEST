namespace Common.ErrorResponses;

public class ErrorResponseWithPagination<T> : ErrorResponse
{
    public Pagination<T> Data { get; set; }

    public ErrorResponseWithPagination(List<string> messages) : base(messages) { }
    public ErrorResponseWithPagination() { }

    internal Task SetDataAsync(Pagination<T> data)
    {
        Data = data;
        return Task.CompletedTask;
    }
}
