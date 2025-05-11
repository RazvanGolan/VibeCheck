using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddedMultipleUsersToSong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Songs_Users_UserId",
                table: "Songs");

            migrationBuilder.DropIndex(
                name: "IX_Songs_UserId",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Songs");

            migrationBuilder.CreateTable(
                name: "SongUser",
                columns: table => new
                {
                    SubmittedSongsSongId = table.Column<string>(type: "text", nullable: false),
                    UsersUserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SongUser", x => new { x.SubmittedSongsSongId, x.UsersUserId });
                    table.ForeignKey(
                        name: "FK_SongUser_Songs_SubmittedSongsSongId",
                        column: x => x.SubmittedSongsSongId,
                        principalTable: "Songs",
                        principalColumn: "SongId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SongUser_Users_UsersUserId",
                        column: x => x.UsersUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SongUser_UsersUserId",
                table: "SongUser",
                column: "UsersUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SongUser");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Songs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "Songs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Songs_UserId",
                table: "Songs",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Songs_Users_UserId",
                table: "Songs",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
