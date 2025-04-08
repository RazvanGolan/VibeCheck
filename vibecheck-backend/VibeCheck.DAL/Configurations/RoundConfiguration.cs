using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Configurations
{
    public class RoundConfiguration : IEntityTypeConfiguration<Round>
    {
        public void Configure(EntityTypeBuilder<Round> builder)
        {
            builder.ToTable("Rounds");

            builder.HasKey(r => r.RoundId);

            builder.Property(r => r.RoundNumber).IsRequired();

            builder.Property(r => r.Status)
                .HasDefaultValue(0);

            // relationship with Game
            builder.HasOne(r => r.Game)
                .WithMany(g => g.RoundsList)
                .HasForeignKey(r => r.GameId)
                .OnDelete(DeleteBehavior.Cascade);

            // relationship with Theme. A round has a theme adn that's it
            builder.HasOne(r => r.Theme)
                .WithMany()
                .HasForeignKey(r => r.ThemeId)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
