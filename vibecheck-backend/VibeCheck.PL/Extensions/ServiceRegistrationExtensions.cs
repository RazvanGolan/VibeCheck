using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VibeCheck.BL.Interfaces;
using VibeCheck.BL.Mapper;
using VibeCheck.BL.Services;
using VibeCheck.DAL;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Repositories;

namespace VibeCheck.PL.Extensions;

public static class ServiceRegistrationExtensions
{
    public static IServiceCollection AddDatabaseConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        // Try to get connection string from environment variable first (for deployed state), then fall back to configuration (for local development) 
        var connectionString = Environment.GetEnvironmentVariable("POSTGRESQLCONNSTR_VibeCheckContext") ?? configuration.GetConnectionString("VibeCheckContext");
        
        services.AddDbContext<VibeCheckContext>(options => options.UseNpgsql(connectionString));
        
        return services;
    }
    
    public static IServiceCollection AddCorsConfiguration(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAnyOrigin", builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });
        
        return services;
    }
    
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IRepository<User>, BaseRepository<User>>();
        services.AddScoped<IRepository<Theme>, BaseRepository<Theme>>();
        services.AddScoped<IRepository<Round>, BaseRepository<Round>>();
        services.AddScoped<IRepository<Song>, BaseRepository<Song>>();
        services.AddScoped<IRepository<Vote>, BaseRepository<Vote>>();
        services.AddScoped<IRepository<PlayerScore>, BaseRepository<PlayerScore>>();
        services.AddScoped<IGameRepository, GameRepository>();

        return services;
    }
    
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddTransient<IUserService, UserService>();
        services.AddTransient<IAuthService, AuthService>();
        services.AddTransient<ISongService, SongService>();
        services.AddTransient<IGameRepository, GameRepository>(); // register repository for Game entity
        services.AddTransient<IGameService, GameService>(); // register service for Game entity
        services.AddAutoMapper(typeof(GameProfile)); // register automapper
        services.AddHttpClient();
        services.AddSignalR();
        
        return services;
    }
    
    public static IServiceCollection AddMappers(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(UserProfile));
        services.AddAutoMapper(typeof(SongProfile));
        
        return services;
    }
    
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"] ?? "default_secret_key");
        var issuer = jwtSettings["Issuer"] ?? "default_issuer";
        
        services.AddAuthorization();
        services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidIssuer = issuer,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });
            
        return services;
    }
}