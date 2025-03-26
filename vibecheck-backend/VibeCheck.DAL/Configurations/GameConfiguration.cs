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

            builder.Property(g => g.Code)
                .IsRequired()
                .HasMaxLength(6);

            builder.Property(g => g.HostUserId)
                .IsRequired();

            builder.Property(g => g.Status)
                .IsRequired();

            //builder.Property(g => g.CreatedAt)
            //    .IsRequired()
            //    .HasDefaultValueSql("GETDATE()");

            // relationship with User
            builder.HasOne(g => g.HostUser)
                .WithMany(u => u.HostedGmaes)
                .HasForeignKey(g => g.HostUserId)
                .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
