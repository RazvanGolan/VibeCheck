using VibeCheck.PL.Extensions;
using System.Text.Json.Serialization;
using VibeCheck.PL.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); // convert enums to strings to see them in response
    });

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
app.MapHub<GameHub>("/gameHub");

app.Run();
