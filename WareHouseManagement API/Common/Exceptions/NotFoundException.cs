namespace Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(Type type, Guid id)
        : base($"{type.Name} not found with Id: {id}") { }

    public NotFoundException(string message) : base(message) { }
}
