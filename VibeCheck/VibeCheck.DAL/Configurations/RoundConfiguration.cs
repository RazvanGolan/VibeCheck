using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Configurations
{
    public class RoundConfiguration : IEntityTypeConfiguration<Round>
    {
        public void Configure(EntityTypeBuilder<Round> builder)
        {
            builder.ToTable("Rounds");

            builder.HasKey(r => r.RoundId);

            builder.Property(r => r.Theme)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(r => r.RoundNumber).IsRequired();

            builder.Property(r => r.Status)
                .HasDefaultValue(0);

            //builder.Property(r => r.StartTime)
            //    .HasDefaultValueSql("GETDATE()");

            // relationship with Game
            builder.HasOne(r => r.Game)
                .WithMany(g => g.Rounds)
                .HasForeignKey(r => r.GameId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}
