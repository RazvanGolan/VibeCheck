# VibeCheck-app

## Backend Overview

- **Architecture**: The backend follows a 3-layer architecture:
  - **DAL (Data Access Layer)**: Handles database interactions using Entity Framework Core.
  - **BL (Business Logic Layer)**: Contains the core business logic and services.
  - **PL (Presentation Layer)**: Exposes APIs using ASP.NET Core Web API.

- **Technologies Used**:
  - **Entity Framework Core**: For database management and migrations.
  - **PostgreSQL**: As the database provider.
  - **ASP.NET Core**: For building the Web API.

- **NuGet Packages Installed**:
  - `Microsoft.EntityFrameworkCore`
  - `Microsoft.EntityFrameworkCore.Tools`
  - `Npgsql.EntityFrameworkCore.PostgreSQL`
  - `Microsoft.EntityFrameworkCore.Design`
  - `Swashbuckle.AspNetCore` (for Swagger/OpenAPI documentation)

- **Database Context**:
  - Configured in `VibeCheck.DAL.VibeCheckContext.cs` with DbSet properties for `Users`, `Games`, `Rounds`, `Songs`, and `Votes`.

- **API Documentation**:
  - Swagger is enabled for API testing and documentation. Access it at `/swagger` when running the application.

- **Connection String**:
  - The database connection string is stored in `appsettings.json` under the `ConnectionStrings` section.

## How to Run
1. Clone the repository.
2. Restore NuGet packages.
3. Update the database using Entity Framework migrations:
   ```bash
   dotnet ef database update