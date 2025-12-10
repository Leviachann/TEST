namespace Common.ErrorResponses;

public class Pagination<T>
{
    public List<T> Data { get; set; }
    public int TotalDataCount { get; set; }

    public Pagination(List<T> datas, int totalDataCount)
    {
        Data = datas;
        TotalDataCount = totalDataCount;
    }

    public Pagination()
    {
        Data = new List<T>();
        TotalDataCount = 0;
    }
}
