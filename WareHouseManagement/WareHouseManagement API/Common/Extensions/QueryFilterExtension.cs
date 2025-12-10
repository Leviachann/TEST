using System.Linq.Expressions;

namespace Common.Extensions;

public static class QueryFilterExtension
{
    public static IQueryable<T> WhereIf<T>(this IQueryable<T> source, object? value, Expression<Func<T, bool>> predicate)
    {
        if (value is null) return source;
        if (value is string s && string.IsNullOrWhiteSpace(s)) return source;

        return source.Where(predicate);
    }
}
