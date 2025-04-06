using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using VibeCheck.BL.Interfaces;
using VibeCheck.BL.Mapper;
using VibeCheck.BL.Services;
using VibeCheck.DAL;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Repositories;
using VibeCheck.PL.Extensions;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); // convert enums to strings to see them in response
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerWithJwt();

var connectionString = builder.Configuration.GetConnectionString("VibeCheckContext");

builder.Services.AddDbContext<VibeCheckContext>(options => 
    options.UseNpgsql(connectionString)
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAnyOrigin", builder =>
    {
        builder.AllowAnyOrigin();
        builder.AllowAnyMethod();
        builder.AllowAnyHeader();
    });
});

builder.Services.AddTransient<IRepository<User>, BaseRepository<User>>(); // register repository for User entity
builder.Services.AddTransient<IUserService, UserService>(); // register service for User entity
builder.Services.AddAutoMapper(typeof(UserProfile)); // register automapper
builder.Services.AddTransient<IAuthService, AuthService>();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"] ?? "default_secret_key");
var issuer = jwtSettings["Issuer"] ?? "default_issuer";

builder.Services.AddAuthorization();
builder.Services.AddAuthentication(x =>
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

builder.Services.AddTransient<IRepository<Game>, BaseRepository<Game>>(); // register repository for Game entity
builder.Services.AddTransient<IGameService, GameService>(); // register service for Game entity
builder.Services.AddAutoMapper(typeof(GameProfile)); // register automapper

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAnyOrigin"); // use cors policy to allow any origin

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
