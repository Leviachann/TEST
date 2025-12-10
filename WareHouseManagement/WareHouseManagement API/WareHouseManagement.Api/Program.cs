using Application;
using Application.Mappings;
using Application.Services;
using DataAccessLayer.Context;
using DataAccessLayer.UnitOfWork;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Repository.Common;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Warehouse Management API",
        Version = "v1",
        Description = "Clean Architecture API with CQRS and Pipeline Behaviors"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddMemoryCache();

builder.Services.AddScoped<IUnitOfWork>(provider =>
{
    var context = provider.GetRequiredService<AppDbContext>();
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    return new SqlUnitOfWork(connectionString!, context);
});

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddApplicationServices();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!))
    };
});

// 🔧 UPDATED CORS - Allow ALL origins for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()      // ✅ Allow requests from any IP/domain
              .AllowAnyMethod()       // ✅ Allow GET, POST, PUT, DELETE, etc.
              .AllowAnyHeader();      // ✅ Allow any headers
    });
});
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Warehouse API v1");
        c.RoutePrefix = "swagger";
    });
}

// 🔧 UPDATED - Use AllowAll CORS policy
app.UseCors("AllowAll");

// 🔧 REMOVED - Don't force HTTPS redirection in development
// app.UseHttpsRedirection();  // ❌ Comment this out for mobile development

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Warehouse Management API Started!");
logger.LogInformation("Swagger UI (HTTPS): https://localhost:7150/swagger");
logger.LogInformation("API (HTTP): http://localhost:5000/api");  // ✅ Add this
logger.LogInformation("Database: {ConnectionString}",
    builder.Configuration.GetConnectionString("DefaultConnection"));
logger.LogInformation("Pipeline Behaviors: Active");
logger.LogInformation("CORS: Allowing all origins (Development Mode)");  // ✅ Add this

app.Run();