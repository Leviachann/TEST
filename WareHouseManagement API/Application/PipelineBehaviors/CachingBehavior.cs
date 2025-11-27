using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Application.PipelineBehaviors
{
    public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;
        private readonly TimeSpan _defaultCacheDuration = TimeSpan.FromMinutes(5);

        public CachingBehavior(
            IMemoryCache cache,
            ILogger<CachingBehavior<TRequest, TResponse>> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;

            if (!requestName.Contains("Query"))
            {
                return await next();
            }

            var cacheKey = GenerateCacheKey(request);

            if (_cache.TryGetValue(cacheKey, out TResponse? cachedResponse) && cachedResponse != null)
            {
                _logger.LogInformation(
                    "[CACHE HIT] Retrieved {RequestName} from cache with key: {CacheKey}",
                    requestName,
                    cacheKey);

                return cachedResponse;
            }

            _logger.LogInformation(
                "[CACHE MISS] {RequestName} not found in cache. Fetching from database...",
                requestName);

            var response = await next();

            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _defaultCacheDuration,
                SlidingExpiration = TimeSpan.FromMinutes(2)
            };

            _cache.Set(cacheKey, response, cacheOptions);

            _logger.LogInformation(
                "[CACHE SET] Cached {RequestName} with key: {CacheKey} for {Duration} minutes",
                requestName,
                cacheKey,
                _defaultCacheDuration.TotalMinutes);

            return response;
        }

        private string GenerateCacheKey(TRequest request)
        {
            var requestType = request.GetType().Name;
            var requestProperties = Newtonsoft.Json.JsonConvert.SerializeObject(request);
            return $"{requestType}_{requestProperties.GetHashCode()}";
        }
    }
}