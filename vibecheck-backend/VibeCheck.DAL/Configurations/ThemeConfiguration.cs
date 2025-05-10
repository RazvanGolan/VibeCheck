using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL.Configurations
{
    public class ThemeConfiguration : IEntityTypeConfiguration<Theme>
    {
        public void Configure(EntityTypeBuilder<Theme> builder)
        {
            builder.ToTable("Themes");

            builder.HasKey(t => t.ThemeId);
             
            builder.Property(t => t.Name).IsRequired().HasMaxLength(100);
            builder.HasIndex(t => t.Name)
                .IsUnique();

            builder.Property(t => t.Category).IsRequired().HasMaxLength(100);

            builder.Property(t => t.CreatedAt)
                .IsRequired();

        }
    }
}
