﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using VibeCheck.DAL;

#nullable disable

namespace VibeCheck.DAL.Migrations
{
    [DbContext(typeof(VibeCheckContext))]
    partial class VibeCheckContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.3")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("VibeCheck.DAL.Entities.Game", b =>
                {
                    b.Property<Guid>("GameId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(6)
                        .HasColumnType("character varying(6)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("HostUserId")
                        .HasColumnType("uuid");

                    b.Property<int>("Status")
                        .HasColumnType("integer");

                    b.HasKey("GameId");

                    b.HasIndex("HostUserId");

                    b.ToTable("Games", (string)null);
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.PlayerScore", b =>
                {
                    b.Property<Guid>("GameId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.Property<int>("TotalScore")
                        .HasColumnType("integer");

                    b.HasKey("GameId", "UserId");

                    b.HasIndex("UserId");

                    b.ToTable("PlayerScores");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Round", b =>
                {
                    b.Property<Guid>("RoundId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("EndTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("GameId")
                        .HasColumnType("uuid");

                    b.Property<int>("RoundNumber")
                        .HasColumnType("integer");

                    b.Property<DateTime>("StartTime")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("Status")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasDefaultValue(0);

                    b.Property<Guid>("ThemeId")
                        .HasColumnType("uuid");

                    b.HasKey("RoundId");

                    b.HasIndex("GameId");

                    b.HasIndex("ThemeId");

                    b.ToTable("Rounds", (string)null);
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Song", b =>
                {
                    b.Property<Guid>("SongId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Artist")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)");

                    b.Property<Guid>("RoundId")
                        .HasColumnType("uuid");

                    b.Property<string>("SongTitle")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("character varying(200)");

                    b.Property<string>("SpotifyUri")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("SubmittedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid");

                    b.HasKey("SongId");

                    b.HasIndex("RoundId");

                    b.HasIndex("UserId");

                    b.ToTable("Songs", (string)null);
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Theme", b =>
                {
                    b.Property<Guid>("ThemeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<string>("Category")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.HasKey("ThemeId");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Themes", (string)null);
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.User", b =>
                {
                    b.Property<Guid>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("character varying(255)");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("character varying(50)");

                    b.HasKey("UserId");

                    b.HasIndex("Email")
                        .IsUnique();

                    b.HasIndex("Username")
                        .IsUnique();

                    b.ToTable("Users", (string)null);
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Vote", b =>
                {
                    b.Property<Guid>("VoteId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid");

                    b.Property<Guid>("RoundId")
                        .HasColumnType("uuid");

                    b.Property<Guid>("SongId")
                        .HasColumnType("uuid");

                    b.Property<DateTime>("VotedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<Guid>("VoterUserId")
                        .HasColumnType("uuid");

                    b.HasKey("VoteId");

                    b.HasIndex("SongId");

                    b.HasIndex("VoterUserId");

                    b.HasIndex("RoundId", "VoterUserId")
                        .IsUnique();

                    b.ToTable("Votes", (string)null);
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Game", b =>
                {
                    b.HasOne("VibeCheck.DAL.Entities.User", "HostUser")
                        .WithMany("HostedGmaes")
                        .HasForeignKey("HostUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("HostUser");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.PlayerScore", b =>
                {
                    b.HasOne("VibeCheck.DAL.Entities.Game", "Game")
                        .WithMany("Leaderboard")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("VibeCheck.DAL.Entities.User", "Player")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Game");

                    b.Navigation("Player");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Round", b =>
                {
                    b.HasOne("VibeCheck.DAL.Entities.Game", "Game")
                        .WithMany("Rounds")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("VibeCheck.DAL.Entities.Theme", "Theme")
                        .WithMany()
                        .HasForeignKey("ThemeId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Game");

                    b.Navigation("Theme");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Song", b =>
                {
                    b.HasOne("VibeCheck.DAL.Entities.Round", "Round")
                        .WithMany("Songs")
                        .HasForeignKey("RoundId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("VibeCheck.DAL.Entities.User", "User")
                        .WithMany("SubmittedSongs")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Round");

                    b.Navigation("User");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Vote", b =>
                {
                    b.HasOne("VibeCheck.DAL.Entities.Round", "Round")
                        .WithMany("Votes")
                        .HasForeignKey("RoundId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("VibeCheck.DAL.Entities.Song", "Song")
                        .WithMany("Votes")
                        .HasForeignKey("SongId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("VibeCheck.DAL.Entities.User", "VoterUser")
                        .WithMany("Votes")
                        .HasForeignKey("VoterUserId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Round");

                    b.Navigation("Song");

                    b.Navigation("VoterUser");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Game", b =>
                {
                    b.Navigation("Leaderboard");

                    b.Navigation("Rounds");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Round", b =>
                {
                    b.Navigation("Songs");

                    b.Navigation("Votes");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.Song", b =>
                {
                    b.Navigation("Votes");
                });

            modelBuilder.Entity("VibeCheck.DAL.Entities.User", b =>
                {
                    b.Navigation("HostedGmaes");

                    b.Navigation("SubmittedSongs");

                    b.Navigation("Votes");
                });
#pragma warning restore 612, 618
        }
    }
}
