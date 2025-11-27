using MediatR;
using Microsoft.Extensions.Logging;
using Repository.Common;

namespace Application.PipelineBehaviors
{
    public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<TransactionBehavior<TRequest, TResponse>> _logger;

        public TransactionBehavior(
            IUnitOfWork unitOfWork,
            ILogger<TransactionBehavior<TRequest, TResponse>> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;

            if (requestName.Contains("Query"))
            {
                _logger.LogDebug(
                    "[READ OPERATION] Skipping transaction for query: {RequestName}",
                    requestName);
                return await next();
            }

            if (_unitOfWork.HasActiveTransaction())
            {
                _logger.LogDebug(
                    "[NESTED TRANSACTION] Using existing transaction for: {RequestName}",
                    requestName);
                return await next();
            }

            _logger.LogInformation(
                "[TRANSACTION START] Beginning transaction for: {RequestName}",
                requestName);

            await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                var response = await next();

                await _unitOfWork.SaveChangeAsync();
                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation(
                    "[TRANSACTION COMMITTED] Successfully committed transaction for: {RequestName}",
                    requestName);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "[TRANSACTION ROLLED BACK] Transaction failed for {RequestName}. Rolling back changes. Error: {ErrorMessage}",
                    requestName,
                    ex.Message);

                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}