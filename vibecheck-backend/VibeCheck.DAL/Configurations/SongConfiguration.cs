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
    public class SongConfiguration : IEntityTypeConfiguration<Song>
    {
        public void Configure(EntityTypeBuilder<Song> builder)
        {
            builder.ToTable("Songs");

            builder.Property(s => s.SongTitle)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(s => s.Artist)
                .IsRequired()
                .HasMaxLength(200);

            // Relationship with Round and User
            builder.HasOne(s => s.Round)
                .WithMany(r => r.Songs)
                .HasForeignKey(s => s.RoundId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.User)
                .WithMany(u => u.SubmittedSongs)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
