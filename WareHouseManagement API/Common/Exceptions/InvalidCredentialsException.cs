namespace Common.Exceptions;

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException(string message) : base(message) { }

    public InvalidCredentialsException(Type type, string message)
        : base($"{type.Name} not found with: {message}") { }
}
