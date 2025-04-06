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

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerWithJwt();

builder.Services.AddDatabaseConfiguration(builder.Configuration);
builder.Services.AddCorsConfiguration();
builder.Services.AddRepositories();
builder.Services.AddServices();
builder.Services.AddMappers();

builder.Services.AddJwtAuthentication(builder.Configuration);

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
