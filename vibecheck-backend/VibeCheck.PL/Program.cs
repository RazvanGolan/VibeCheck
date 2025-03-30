using Microsoft.EntityFrameworkCore;
using VibeCheck.BL.Interfaces;
using VibeCheck.BL.Mapper;
using VibeCheck.BL.Services;
using VibeCheck.DAL;
using VibeCheck.DAL.Entities;
using VibeCheck.DAL.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

//builder.Services.AddControllers().AddJsonOptions(options =>
//{
//    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
//}); // or use that instead if you want to ignore cycles

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAnyOrigin"); // use cors policy to allow any origin

app.UseAuthorization();

app.MapControllers();

app.Run();
