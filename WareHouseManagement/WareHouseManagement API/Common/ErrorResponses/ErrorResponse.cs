namespace Common.ErrorResponses;

public class ErrorResponse
{
    public bool IsSuccess { get; set; }
    public List<string> Errors { get; set; }

    public ErrorResponse(List<string> messages)
    {
        Errors = messages;
        IsSuccess = false;
    }

    public ErrorResponse()
    {
        IsSuccess = true;
        Errors = null;
    }
}

public class ErrorResponse<T> : ErrorResponse
{
    public T Data { get; set; }

    public ErrorResponse(List<string> messages) : base(messages) { }
    public ErrorResponse() { }
}
