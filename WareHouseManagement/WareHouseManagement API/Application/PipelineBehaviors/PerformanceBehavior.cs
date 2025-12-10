using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Application.PipelineBehaviors;

public class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;
    private readonly Stopwatch _stopwatch;

    private const int PerformanceThresholdMs = 500;

    public PerformanceBehavior(ILogger<PerformanceBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
        _stopwatch = new Stopwatch();
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        _stopwatch.Start();

        var response = await next();

        _stopwatch.Stop();

        var elapsedMilliseconds = _stopwatch.ElapsedMilliseconds;

        if (elapsedMilliseconds > PerformanceThresholdMs)
        {
            _logger.LogWarning(
                "Long Running Request: {RequestName} took {ElapsedMilliseconds}ms (threshold: {ThresholdMs}ms)",
                requestName,
                elapsedMilliseconds,
                PerformanceThresholdMs);
        }
        else
        {
            _logger.LogInformation(
                "Request {RequestName} completed in {ElapsedMilliseconds}ms",
                requestName,
                elapsedMilliseconds);
        }

        return response;
    }
}