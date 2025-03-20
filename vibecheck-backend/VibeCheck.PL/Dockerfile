FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["VibeCheck.PL/VibeCheck.PL.csproj", "VibeCheck.PL/"]
COPY ["VibeCheck.BL/VibeCheck.BL.csproj", "VibeCheck.BL/"]
COPY ["VibeCheck.DAL/VibeCheck.DAL.csproj", "VibeCheck.DAL/"]
RUN dotnet restore "VibeCheck.PL/VibeCheck.PL.csproj"
COPY . .
WORKDIR "/src/VibeCheck.PL"
RUN dotnet build "VibeCheck.PL.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "VibeCheck.PL.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VibeCheck.PL.dll"]