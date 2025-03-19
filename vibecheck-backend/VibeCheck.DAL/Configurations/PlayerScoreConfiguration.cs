using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Configurations
{
    public class PlayerScoreConfiguration : IEntityTypeConfiguration<PlayerScore>
    {
        public void Configure(EntityTypeBuilder<PlayerScore> builder)
        {
            builder.HasKey(ps => new { ps.GameId, ps.UserId });

            builder.HasOne(ps => ps.Game)
                .WithMany(g => g.Leaderboard)
                .HasForeignKey(ps => ps.GameId);

            builder.HasOne(ps => ps.Player) // a user can have multiple scores in different games
                .WithMany()
                .HasForeignKey(ps => ps.UserId);
        }
    }
}
