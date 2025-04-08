using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
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
                .IsRequired()
                .HasConversion<string>();  // Store enum as string

            // New properties
            builder.Property(g => g.Rounds)
                .IsRequired()
                .HasDefaultValue(5);

            builder.Property(g => g.PlayersLimit)
                .IsRequired()
                .HasDefaultValue(8);

            builder.Property(g => g.TimePerRound)
                .IsRequired()
                .HasDefaultValue(60);

            builder.Property(g => g.Privacy)
                .IsRequired()
                .HasMaxLength(10)
                .HasConversion<string>();

            builder.Property(g => g.Mode)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(g => g.SelectedThemeCategories)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

            builder.Property(g => g.CustomThemes)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

            builder.HasOne(g => g.HostUser)
                .WithMany(u => u.HostedGames) 
                .HasForeignKey(g => g.HostUserId)
                .OnDelete(DeleteBehavior.Restrict);

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
