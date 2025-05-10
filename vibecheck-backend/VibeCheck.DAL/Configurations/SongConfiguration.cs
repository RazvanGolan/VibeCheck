using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Configurations
{
    public class SongConfiguration : IEntityTypeConfiguration<Song>
    {
        public void Configure(EntityTypeBuilder<Song> builder)
        {
            builder.ToTable("Songs");

            builder.HasKey(s => s.SongId);

            builder.Property(s => s.SongTitle)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(s => s.Artist)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(s => s.UserName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(s => s.SubmittedAt)
                .IsRequired();

            // Add new properties
            builder.Property(s => s.AlbumName);
            builder.Property(s => s.AlbumCoverSmall);
            builder.Property(s => s.AlbumCoverBig);
            builder.Property(s => s.PreviewUrl);

            // Relationships
            builder.HasOne(s => s.Round)
                .WithMany(r => r.Songs)
                .HasForeignKey(s => s.RoundId);

            builder.HasOne(s => s.User)
                .WithMany(u => u.SubmittedSongs)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.Votes)
                .WithOne(v => v.Song)
                .HasForeignKey(v => v.SongId);
        }
    }
}
