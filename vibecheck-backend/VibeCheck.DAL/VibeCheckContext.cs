using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VibeCheck.DAL.Configurations;
using VibeCheck.DAL.Entities;

namespace VibeCheck.DAL
{
    public class VibeCheckContext : DbContext
    {
        public VibeCheckContext(DbContextOptions<VibeCheckContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Game> Games { get; set; } = null!;
        public DbSet<Round> Rounds { get; set; } = null!;
        public DbSet<Song> Songs { get; set; } = null!;
        public DbSet<Vote> Votes { get; set; } = null!;
        public DbSet<Theme> Themes { get; set; } = null!;
        public DbSet<PlayerScore> PlayerScores { get; set; } = null!;


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // apply configurations
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new GameConfiguration());
            modelBuilder.ApplyConfiguration(new RoundConfiguration());
            modelBuilder.ApplyConfiguration(new SongConfiguration());
            modelBuilder.ApplyConfiguration(new VoteConfiguration());
            modelBuilder.ApplyConfiguration(new ThemeConfiguration());
            modelBuilder.ApplyConfiguration(new PlayerScoreConfiguration());

        }

    }
}
