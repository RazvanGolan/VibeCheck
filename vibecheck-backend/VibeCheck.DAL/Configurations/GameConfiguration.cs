using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Configurations
{
    public class GameConfiguration : IEntityTypeConfiguration<Game>
    {
        public void Configure(EntityTypeBuilder<Game> builder)
        {
            builder.ToTable("Games");

            builder.HasKey(g => g.GameId);

            // Existing properties
            builder.Property(g => g.Code)
                .IsRequired()
                .HasMaxLength(6);

            builder.Property(g => g.HostUserId)
                .IsRequired();

            builder.Property(g => g.Status)
                .HasConversion<string>()  // Store enum as string
                .IsRequired();

            // New properties
            builder.Property(g => g.TotalRounds)
                .HasDefaultValue(5);

            builder.Property(g => g.CurrentRound)
                .HasDefaultValue(1);

            builder.Property(g => g.PlayersLimit)
                .HasDefaultValue(8);

            builder.Property(g => g.TimePerRound)
                .HasDefaultValue(60);

            builder.Property(g => g.Privacy)
                .IsRequired()
                .HasConversion<string>(); // storing the enum as string

            builder.Property(g => g.Mode)
                .IsRequired()
                .HasConversion<string>();

            var listComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                c => c != null ? c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())) : 0,
                c => c != null ? new List<string>(c) : new List<string>()
            );

            builder.Property(g => g.SelectedThemeCategories)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
                .Metadata.SetValueComparer(listComparer);

            builder.Property(g => g.CustomThemes)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
                .Metadata.SetValueComparer(listComparer);

            // Configure relationships
            builder.HasOne(g => g.HostUser)
                .WithMany(u => u.HostedGames)
                .HasForeignKey(g => g.HostUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(g => g.RoundsList)
                .WithOne(r => r.Game)
                .HasForeignKey(r => r.GameId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(g => g.Leaderboard)
                .WithOne(ps => ps.Game)
                .HasForeignKey(ps => ps.GameId);

            builder.HasMany(g => g.Participants)
                   .WithMany(u => u.JoinedGames)
                   .UsingEntity<Dictionary<string, object>>(
                        "GameParticipants", // Name of the join table
                        j => j.HasOne<User>()
                              .WithMany()
                              .HasForeignKey("UserId")
                              .OnDelete(DeleteBehavior.Cascade), // Define foreign key to User
                        j => j.HasOne<Game>()
                              .WithMany()
                              .HasForeignKey("GameId")
                              .OnDelete(DeleteBehavior.Cascade)  // Define foreign key to Game
                    );

        }
    }
}
