using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Configurations
{
    public class VoteConfiguration : IEntityTypeConfiguration<Vote>
    {
        public void Configure(EntityTypeBuilder<Vote> builder)
        {
            builder.ToTable("Votes");

            builder.HasKey(v => v.VoteId);

            builder.Property(v => v.SongId)
                .IsRequired();

            builder.Property(v => v.VotedAt)
                .IsRequired();

            // Prevent duplicate votes in same round
            builder.HasIndex(v => new { v.RoundId, v.VoterUserId })
                .IsUnique();

            // Relationships
            builder.HasOne(v => v.Round)
                .WithMany(r => r.Votes)
                .HasForeignKey(v => v.RoundId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(v => v.VoterUser)
                .WithMany(u => u.Votes)
                .HasForeignKey(v => v.VoterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Song)
                .WithMany(s => s.Votes)
                .HasForeignKey(v => v.SongId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
