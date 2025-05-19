using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddedMultipleUsersToSongs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Drop existing foreign key constraints
            migrationBuilder.Sql("ALTER TABLE \"Votes\" DROP CONSTRAINT IF EXISTS \"FK_Votes_Songs_SongId\"");
            
            migrationBuilder.DropForeignKey(
                name: "FK_Songs_Users_UserId",
                table: "Songs");

            migrationBuilder.DropIndex(
                name: "IX_Votes_RoundId_VoterUserId",
                table: "Votes");

            migrationBuilder.DropIndex(
                name: "IX_Songs_UserId",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Songs");

            // Step 2: Modify the column types (first Songs, then Votes)
            migrationBuilder.Sql("ALTER TABLE \"Songs\" ALTER COLUMN \"SongId\" TYPE uuid USING \"SongId\"::uuid");
            migrationBuilder.Sql("ALTER TABLE \"Votes\" ALTER COLUMN \"SongId\" TYPE uuid USING \"SongId\"::uuid");

            migrationBuilder.AddColumn<string>(
                name: "DeezerSongId",
                table: "Votes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DeezerId",
                table: "Songs",
                type: "text",
                nullable: false,
                defaultValue: "");

            // Step 3: Create the join table for many-to-many relationship
            migrationBuilder.CreateTable(
                name: "SongUser",
                columns: table => new
                {
                    SubmittedSongsSongId = table.Column<Guid>(type: "uuid", nullable: false),
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

            // Step 4: Re-create the foreign key constraint
            migrationBuilder.Sql("ALTER TABLE \"Votes\" ADD CONSTRAINT \"FK_Votes_Songs_SongId\" FOREIGN KEY (\"SongId\") REFERENCES \"Songs\"(\"SongId\") ON DELETE RESTRICT");

            // Step 5: Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_Votes_RoundId_VoterUserId_SongId",
                table: "Votes",
                columns: new[] { "RoundId", "VoterUserId", "SongId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SongUser_UsersUserId",
                table: "SongUser",
                column: "UsersUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Step 1: Drop tables and indexes
            migrationBuilder.DropTable(
                name: "SongUser");

            migrationBuilder.DropIndex(
                name: "IX_Votes_RoundId_VoterUserId_SongId",
                table: "Votes");

            // Step 2: Drop foreign key constraints
            migrationBuilder.Sql("ALTER TABLE \"Votes\" DROP CONSTRAINT IF EXISTS \"FK_Votes_Songs_SongId\"");

            // Step 3: Drop the new columns
            migrationBuilder.DropColumn(
                name: "DeezerSongId",
                table: "Votes");

            migrationBuilder.DropColumn(
                name: "DeezerId",
                table: "Songs");

            // Step 4: Convert back to text types
            migrationBuilder.Sql("ALTER TABLE \"Songs\" ALTER COLUMN \"SongId\" TYPE text USING \"SongId\"::text");
            migrationBuilder.Sql("ALTER TABLE \"Votes\" ALTER COLUMN \"SongId\" TYPE text USING \"SongId\"::text");

            // Step 5: Add back the removed columns
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

            // Step 6: Recreate indexes and constraints
            migrationBuilder.CreateIndex(
                name: "IX_Votes_RoundId_VoterUserId",
                table: "Votes",
                columns: new[] { "RoundId", "VoterUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Songs_UserId",
                table: "Songs",
                column: "UserId");

            // Step 7: Re-add foreign key constraint
            migrationBuilder.Sql("ALTER TABLE \"Votes\" ADD CONSTRAINT \"FK_Votes_Songs_SongId\" FOREIGN KEY (\"SongId\") REFERENCES \"Songs\"(\"SongId\") ON DELETE RESTRICT");

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
