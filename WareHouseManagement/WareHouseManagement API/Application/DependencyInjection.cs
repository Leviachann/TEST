using Application.CQRS.Auth.Handlers;
using Application.CQRS.Blueprints.Handlers.CommandHandler;
using Application.CQRS.Blueprints.Handlers.QueryHandler;
using Application.CQRS.Categories.Handlers;
using Application.CQRS.Categories.Handlers.CommandHandlers;
using Application.CQRS.Categories.Handlers.QueryHandlers;
using Application.CQRS.Inventories.Handlers.CommandHandlers;
using Application.CQRS.Inventories.Handlers.QueryHandler;
using Application.CQRS.Locations.Handlers.CommandHandler;
using Application.CQRS.Locations.Handlers.QueryHandler;
using Application.CQRS.OrderLines.Handlers.CommandHandler;
using Application.CQRS.OrderLines.Handlers.ControllerHandler;
using Application.CQRS.OrderLines.Handlers.QueryHandler;
using Application.CQRS.Orders.Handlers.CommandHandler;
using Application.CQRS.Orders.Handlers.QueryHandler;
using Application.CQRS.Products.Handlers.CommandHandler;
using Application.CQRS.Products.Handlers.QueryHandler;
using Application.CQRS.Racks.Handlers.CommandHandler;
using Application.CQRS.Racks.Handlers.QueryHandler;
using Application.CQRS.Suppliers.Handlers.CommandHandler;
using Application.CQRS.Suppliers.Handlers.QueryHandler;
using Application.CQRS.Users.Handlers.CommandHandler;
using Application.CQRS.Users.Handlers.QueryHandler;
using Application.PipelineBehaviors;
using Application.Services;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
        });

        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(UnhandledExceptionBehavior<,>));

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));

        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(TransactionBehavior<,>));

        services.AddScoped<IJwtTokenService, JwtTokenService>();

        RegisterCommandHandlers(services);
        RegisterQueryHandlers(services);

        return services;
    }

    private static void RegisterCommandHandlers(IServiceCollection services)
    {
        services.AddScoped<LoginCommandHandler>();
        services.AddScoped<RefreshTokenCommandHandler>();
        services.AddScoped<LogoutCommandHandler>();

        services.AddScoped<RegisterUserCommandHandler>();
        services.AddScoped<UpdateUserCommandHandler>();
        services.AddScoped<DeleteUserCommandHandler>();

        services.AddScoped<AddCategoryCommandHandler>();
        services.AddScoped<UpdateCategoryCommandHandler>();
        services.AddScoped<DeleteCategoryCommandHandler>();

        services.AddScoped<AddProductCommandHandler>();
        services.AddScoped<UpdateProductCommandHandler>();
        services.AddScoped<DeleteProductCommandHandler>();

        services.AddScoped<AddSupplierCommandHandler>();
        services.AddScoped<UpdateSupplierCommandHandler>();
        services.AddScoped<DeleteSupplierCommandHandler>();

        services.AddScoped<AddOrderCommandHandler>();
        services.AddScoped<UpdateOrderCommandHandler>();
        services.AddScoped<DeleteOrderCommandHandler>();

        services.AddScoped<AddOrderLineCommandHandler>();
        services.AddScoped<UpdateOrderLineCommandHandler>();
        services.AddScoped<DeleteOrderLineCommandHandler>();

        services.AddScoped<AddInventoryCommandHandler>();
        services.AddScoped<UpdateInventoriesCommandHandler>();
        services.AddScoped<DeleteInventoriesCommandHandler>();

        services.AddScoped<AddLocationCommandHandler>();
        services.AddScoped<UpdateLocationCommandHandler>();
        services.AddScoped<DeleteLocationCommandHandler>();
    }

    private static void RegisterQueryHandlers(IServiceCollection services)
    {

        services.AddScoped<AddBlueprintCommandHandler>();
        services.AddScoped<UpdateBlueprintCommandHandler>();
        services.AddScoped<DeleteBlueprintCommandHandler>();
        services.AddScoped<GetAllBlueprintsQueryHandler>();
        services.AddScoped<GetByIdBlueprintQueryHandler>();

        services.AddScoped<AddRackCommandHandler>();
        services.AddScoped<UpdateRackCommandHandler>();
        services.AddScoped<DeleteRackCommandHandler>();
        services.AddScoped<GetRacksByBlueprintQueryHandler>();


        services.AddScoped<GetAllUsersQueryHandler>();
        services.AddScoped<GetUserByIdQueryHandler>();
        services.AddScoped<GetMeQueryHandler>();

        services.AddScoped<GetAllCategoriesQueryHandler>();
        services.AddScoped<GetCategoryByIdQueryHandler>();
        services.AddScoped<FilterCategoriesQueryHandler>();
        services.AddScoped<GetRackByIdQueryHandler>();

        services.AddScoped<GetAllProductsQueryHandler>();
        services.AddScoped<GetProductByIdQueryHandler>();
        services.AddScoped<GetProductsByCategoryQueryHandler>();
        services.AddScoped<GetProductsBySupplierQueryHandler>();
        services.AddScoped<FilterProductsQueryHandler>();

        services.AddScoped<GetAllSuppliersQueryHandler>();
        services.AddScoped<GetSupplierByIdQueryHandler>();
        services.AddScoped<FilterSuppliersQueryHandler>();

        services.AddScoped<GetAllOrdersQueryHandler>();
        services.AddScoped<GetOrderByIdQueryHandler>();
        services.AddScoped<FilterOrdersQueryHandler>();

        services.AddScoped<GetAllOrderLinesQueryHandler>();
        services.AddScoped<GetOrderLineByIdQueryHandler>();
        services.AddScoped<FilterOrderLinesQueryHandler>();

        services.AddScoped<GetAllInventoriesQueryHandler>();
        services.AddScoped<GetByIdInventoryQueryHandler>();
        services.AddScoped<GetByProductIdInventoryQueryHandler>();

        services.AddScoped<GetAllLocationsQueryHandler>();
        services.AddScoped<GetByIdLocationQueryHandler>();
        services.AddScoped<FilterLocationsQueryHandler>();
    }
}