using Application.CQRS.Blueprints.Commands.Request;
using Application.CQRS.Blueprints.Commands.Response;
using Application.CQRS.Blueprints.Queries.Response;
using Application.CQRS.Categories.Commands.Request;
using Application.CQRS.Inventories.Commands.Request;
using Application.CQRS.Locations.Commands.Request;
using Application.CQRS.OrderLines.Commands.Request;
using Application.CQRS.Orders.Commands;
using Application.CQRS.Orders.Commands.Request;
using Application.CQRS.Products.Commands.Request;
using Application.CQRS.Racks.Commands.Request;
using Application.CQRS.Racks.Commands.Response;
using Application.CQRS.Racks.Queries.Response;
using Application.CQRS.Suppliers.Commands.Request;
using Application.CQRS.Users.Commands.Request;
using AutoMapper;
using Domain.Entities;

namespace Application.MappingProfiles
{
    public class EntityMappingProfile : Profile
    {

        public EntityMappingProfile()
        {
            CreateMap<AddRackCommandRequest, Rack>()
            .AfterMap((src, dest) =>
            {
                dest.Id = Guid.NewGuid();
                dest.CreatedDate = DateTime.UtcNow;
                dest.IsDeleted = false;
            });

            CreateMap<Rack, AddRackCommandResponse>()
                .ForMember(dest => dest.LocationCount, opt => opt.MapFrom(src => src.Locations != null ? src.Locations.Count : 0));

            CreateMap<UpdateRackCommandRequest, Rack>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.BlueprintId, opt => opt.Ignore());

            CreateMap<Rack, GetRacksByBlueprintQueryResponse>()
                .ForMember(dest => dest.LocationCount, opt => opt.MapFrom(src => src.Locations != null ? src.Locations.Count : 0));

            CreateMap<DeleteRackCommandRequest, Rack>();
            CreateMap<Rack, DeleteRackCommandResponse>();

            CreateMap<AddBlueprintCommandRequest, Blueprint>()
            .AfterMap((src, dest) =>
            {
                dest.Id = Guid.NewGuid();
                dest.CreatedDate = DateTime.UtcNow;
                dest.IsDeleted = false;
            });

            CreateMap<Blueprint, AddBlueprintCommandResponse>();

            CreateMap<UpdateBlueprintCommandRequest, Blueprint>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<Blueprint, GetAllBlueprintsQueryResponse>()
                .ForMember(dest => dest.RackCount, opt => opt.MapFrom(src => src.Racks != null ? src.Racks.Count : 0));

            CreateMap<Blueprint, GetByIdBlueprintQueryResponse>();

            CreateMap<DeleteBlueprintCommandRequest, Blueprint>();
            CreateMap<Blueprint, DeleteBlueprintCommandResponse>();

            CreateMap<AddOrderCommandRequest.OrderLineDto, OrderLine>()
                .AfterMap((src, dest) =>
                {
                    dest.Id = Guid.NewGuid();
                    dest.CreatedDate = DateTime.UtcNow;
                    dest.IsDeleted = false;
                });


            CreateMap<AddCategoryCommandRequest, Category>()
                .AfterMap((src, dest) =>
                {
                    dest.Id = Guid.NewGuid();
                    dest.CreatedDate = DateTime.UtcNow;
                    dest.IsDeleted = false;
                });

            CreateMap<AddProductCommandRequest, Product>()
                .AfterMap((src, dest) =>
                {
                    dest.Id = Guid.NewGuid();
                    dest.CreatedDate = DateTime.UtcNow;
                    dest.IsDeleted = false;
                });

            CreateMap<AddInventoriesCommandRequest, Inventory>()
                .AfterMap((src, dest) =>
                {
                    dest.Id = Guid.NewGuid();
                    dest.CreatedDate = DateTime.UtcNow;
                    dest.IsDeleted = false;
                });

            CreateMap<AddLocationCommandRequest, Location>()
                .AfterMap((src, dest) =>
                {
                    dest.Id = Guid.NewGuid();
                    dest.CreatedDate = DateTime.UtcNow;
                    dest.IsDeleted = false;
                });

            CreateMap<AddSupplierCommandRequest, Supplier>()
                .AfterMap((src, dest) =>
                {
                    dest.Id = Guid.NewGuid();
                    dest.CreatedDate = DateTime.UtcNow;
                    dest.IsDeleted = false;
                });

            CreateMap<AddOrderCommandRequest, Order>()
                .AfterMap((src, dest) =>
                {
                    dest.Id = Guid.NewGuid();
                    dest.CreatedDate = DateTime.UtcNow;
                    dest.IsDeleted = false;
                });
            CreateMap<AddOrderLineCommandRequest, OrderLine>()
                .AfterMap((src, dest) =>
                {
                    dest.Id = Guid.NewGuid();
                    dest.CreatedDate = DateTime.UtcNow;
                    dest.IsDeleted = false;
                });
            CreateMap<RegisterUserCommandRequest, User>()
               .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
               .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
               .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
               .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
               .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
               .AfterMap((src, dest) =>
               {
                   dest.Id = Guid.NewGuid();
                   dest.CreatedDate = DateTime.UtcNow;
                   dest.IsDeleted = false;
               });

            CreateMap<UpdateCategoryCommandRequest, Category>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));

            CreateMap<UpdateProductCommandRequest, Product>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateSupplierCommandRequest, Supplier>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateOrderCommandRequest, Order>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateOrderLineCommandRequest, OrderLine>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateInventoriesCommandRequest, Inventory>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateLocationCommandRequest, Location>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());

            CreateMap<UpdateUserCommandRequest, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.UserName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role));

            CreateMap<DeleteCategoryCommandRequest, Category>();
            CreateMap<DeleteInventoriesCommandRequest, Inventory>();
            CreateMap<DeleteLocationCommandRequest, Location>();
            CreateMap<DeleteOrderCommandRequest, Order>();
            CreateMap<DeleteOrderLineCommandRequest, OrderLine>();
            CreateMap<DeleteProductCommandRequest, Product>();
            CreateMap<DeleteSupplierCommandRequest, Supplier>();

        }

    }
}