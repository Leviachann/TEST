using Application.CQRS.Categories.Commands.Response;
using Application.CQRS.Categories.Queries.Response;
using Application.CQRS.Inventories.Commands.Response;
using Application.CQRS.Inventories.Query.Response;
using Application.CQRS.Locations.Commands.Response;
using Application.CQRS.Locations.Queries.Response;
using Application.CQRS.OrderLines.Commands.Response;
using Application.CQRS.OrderLines.CommandsResponse;
using Application.CQRS.OrderLines.Queries.Response;
using Application.CQRS.Orders.Commands.Response;
using Application.CQRS.Orders.Queries.Response;
using Application.CQRS.Products.Commands.Response;
using Application.CQRS.Products.Queries.Response;
using Application.CQRS.Racks.Queries.Response;
using Application.CQRS.Suppliers.Commands.Response;
using Application.CQRS.Suppliers.Queries.Response;
using Application.CQRS.Users.Commands.Response;
using Application.CQRS.Users.Queries;
using Application.CQRS.Users.Queries.Response;
using AutoMapper;
using Domain.Entities;

namespace Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Rack, GetRackByIdQueryResponse>()
                .ForMember(dest => dest.LocationCount, opt => opt.MapFrom(src => src.Locations != null ? src.Locations.Count : 0));
            CreateMap<Order, OrderResponse>()
             .ForMember(dest => dest.OrderLines, opt => opt.MapFrom(src => src.OrderLines));

            CreateMap<OrderLine, OrderResponse.OrderLineDto>();

            CreateMap<Category, AddCategoryCommandResponse>();
            CreateMap<Category, DeleteCategoryCommandResponse>()
                .AfterMap((src, dest) =>
                {
                    dest.IsDeleted = true;
                    dest.DeletedDate = DateTime.UtcNow;
                });
            CreateMap<Category, GetAllCategoriesQueryResponse>();
            CreateMap<Category, FilterCategoriesQueryResponse>();
            CreateMap<Category, GetCategoryByIdQueryResponse>();

            CreateMap<Inventory, AddInventoriesCommandResponse>();
            CreateMap<Inventory, DeleteInventoriesCommandResponse>()
                .AfterMap((src, dest) =>
                {
                    dest.IsDeleted = true;
                    dest.DeletedDate = DateTime.UtcNow;
                });
            CreateMap<Inventory, GetAllInventoriesQueryResponse>();
            CreateMap<Inventory, GetByIdInventoriesQueryResponse>();
            CreateMap<Inventory, GetByProductIdInventoryQueryResponse>();

            CreateMap<Location, AddLocationCommandResponse>();
            CreateMap<Location, DeleteLocationCommandResponse>()
                .AfterMap((src, dest) =>
                {
                    dest.IsDeleted = true;
                    dest.DeletedDate = DateTime.UtcNow;
                });
            CreateMap<Location, GetAllLocationsQueryResponse>()
                .ForMember(dest => dest.Rack, opt => opt.MapFrom(src =>
                    src.Rack != null ? new RackBasicInfo
                    {
                        Id = src.Rack.Id,
                        Name = src.Rack.Name,
                        BlueprintId = src.Rack.BlueprintId
                    } : null));
            CreateMap<Location, GetByIdLocationQueryResponse>();
            CreateMap<Location, FilterLocationsQueryResponse>();

            CreateMap<OrderLine, AddOrderLineCommandResponse>();
            CreateMap<OrderLine, DeleteOrderLineCommandResponse>()
                .AfterMap((src, dest) =>
                {
                    dest.IsDeleted = true;
                    dest.DeletedDate = DateTime.UtcNow;
                });
            CreateMap<OrderLine, GetAllOrderLinesQueryResponse>();
            CreateMap<OrderLine, FilterOrderLinesQueryResponse>();
            CreateMap<OrderLine, GetOrderLineByIdQueryResponse>();

            CreateMap<Order, AddOrderCommandResponse>();
            CreateMap<Order, DeleteOrderCommandResponse>()
                .AfterMap((src, dest) =>
                {
                    dest.IsDeleted = true;
                    dest.DeletedDate = DateTime.UtcNow;
                });
            CreateMap<Product, AddProductCommandResponse>();
            CreateMap<Product, DeleteProductCommandResponse>()
                .AfterMap((src, dest) =>
                {
                    dest.IsDeleted = true;
                    dest.DeletedDate = DateTime.UtcNow;
                });

            CreateMap<Product, GetAllProductsQueryResponse>()
                .ForMember(dest => dest.OrderLineIds, opt => opt.MapFrom(src => src.OrderLines.Select(ol => ol.Id).ToList()))
                .ForMember(dest => dest.Stock, opt => opt.MapFrom(src => src.Inventory != null ? src.Inventory.CurrentStock : 0));


            CreateMap<Product, FilterProductsQueryResponse>()
                .ForMember(dest => dest.OrderLineIds, opt => opt.MapFrom(src => src.OrderLines.Select(ol => ol.Id).ToList()))
                .ForMember(dest => dest.Stock, opt => opt.MapFrom(src => src.Inventory != null ? src.Inventory.CurrentStock : 0));

            CreateMap<Product, GetProductByIdQueryResponse>()
                .ForMember(dest => dest.OrderLineIds, opt => opt.MapFrom(src => src.OrderLines.Select(ol => ol.Id).ToList()))
                .ForMember(dest => dest.Stock, opt => opt.MapFrom(src => src.Inventory != null ? src.Inventory.CurrentStock : 0));

            CreateMap<Product, GetProductsByCategoryQueryResponse>()
                .ForMember(dest => dest.OrderLineIds, opt => opt.MapFrom(src => src.OrderLines.Select(ol => ol.Id).ToList()))
                .ForMember(dest => dest.Stock, opt => opt.MapFrom(src => src.Inventory != null ? src.Inventory.CurrentStock : 0));

            CreateMap<Product, GetProductsBySupplierQueryResponse>()
                .ForMember(dest => dest.OrderLineIds, opt => opt.MapFrom(src => src.OrderLines.Select(ol => ol.Id).ToList()))
                .ForMember(dest => dest.Stock, opt => opt.MapFrom(src => src.Inventory != null ? src.Inventory.CurrentStock : 0));

            CreateMap<Supplier, AddSupplierCommandResponse>();
            CreateMap<Supplier, DeleteSupplierCommandResponse>()
                .AfterMap((src, dest) =>
                {
                    dest.IsDeleted = true;
                    dest.DeletedDate = DateTime.UtcNow;
                });

            CreateMap<Supplier, GetAllSuppliersQueryResponse>()
                .ForMember(dest => dest.ProductIds,
                    opt => opt.MapFrom(src => src.Products.Select(p => p.Id).ToList()))
                .ForMember(dest => dest.OrdersIds,
                    opt => opt.MapFrom(src => src.Orders.Select(o => o.Id).ToList()));

            CreateMap<Supplier, FilterSuppliersQueryResponse>()
                .ForMember(dest => dest.ProductIds,
                    opt => opt.MapFrom(src => src.Products.Select(p => p.Id).ToList()))
                .ForMember(dest => dest.OrdersIds,
                    opt => opt.MapFrom(src => src.Orders.Select(o => o.Id).ToList()));

            CreateMap<Supplier, GetSupplierByIdQueryResponse>()
                .ForMember(dest => dest.ProductIds,
                    opt => opt.MapFrom(src => src.Products.Select(p => p.Id).ToList()))
                .ForMember(dest => dest.OrdersIds,
                    opt => opt.MapFrom(src => src.Orders.Select(o => o.Id).ToList()));

            CreateMap<User, DeleteUserCommandResponse>()
                .AfterMap((src, dest) =>
                {
                    dest.IsDeleted = true;
                    dest.DeletedDate = DateTime.UtcNow;
                });
            CreateMap<User, GetAllUsersQueryResponse>();
            CreateMap<User, GetUserByIdQueryResponse>();
            CreateMap<User, GetMeQueryResponse>();
            CreateMap<User, RegisterUserCommandResponse>()
               .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
               .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
               .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
               .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
               .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate));
        }
    }
}