using System.Text;

namespace Common.Exceptions;

public class InvalidClientException : Exception
{
    public InvalidClientException(string message) : base(message) { }

    public InvalidClientException(IEnumerable<string> messages) : base(FormatMessages(messages)) { }

    private static string FormatMessages(IEnumerable<string> messages)
    {
        var sb = new StringBuilder();
        foreach (var msg in messages)
            sb.AppendLine(msg);
        return sb.ToString();
    }
}
