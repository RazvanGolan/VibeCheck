using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Configurations
{
    public class PlayerScoreConfiguration : IEntityTypeConfiguration<PlayerScore>
    {
        public void Configure(EntityTypeBuilder<PlayerScore> builder)
        {
            builder.HasKey(ps => ps.PlayerScoreId);

            builder.Property(ps => ps.TotalScore)
                .IsRequired();
                
            // Relationships
            builder.HasOne(ps => ps.Game)
                .WithMany(g => g.Leaderboard)
                .HasForeignKey(ps => ps.GameId);
                
            builder.HasOne(ps => ps.Player)
                .WithMany()
                .HasForeignKey(ps => ps.UserId);
        }
    }
}
