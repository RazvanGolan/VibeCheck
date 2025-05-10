using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.DAL.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSongEntityToUseDeezerIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, drop the foreign key constraint
            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Songs_SongId",
                table: "Votes");

            // Now make your changes
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Themes");

            migrationBuilder.DropColumn(
                name: "SpotifyUri",
                table: "Songs");

            // Change the SongId column type in Songs first
            migrationBuilder.AlterColumn<string>(
                name: "SongId",
                table: "Songs",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            // Then change it in Votes
            migrationBuilder.AlterColumn<string>(
                name: "SongId",
                table: "Votes",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "Songs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            // Finally, recreate the foreign key constraint
            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Songs_SongId",
                table: "Votes",
                column: "SongId",
                principalTable: "Songs",
                principalColumn: "SongId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // In the Down method, do the reverse operations in the correct order
            migrationBuilder.DropForeignKey(
                name: "FK_Votes_Songs_SongId",
                table: "Votes");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Songs");

            migrationBuilder.AlterColumn<Guid>(
                name: "SongId",
                table: "Songs",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "SongId",
                table: "Votes",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Themes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpotifyUri",
                table: "Songs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Votes_Songs_SongId",
                table: "Votes",
                column: "SongId",
                principalTable: "Songs",
                principalColumn: "SongId",
                onDelete: ReferentialAction.Restrict);
        }

    }
}
