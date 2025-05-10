using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.DAL.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedEntites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PlayerScores",
                table: "PlayerScores");

            migrationBuilder.RenameColumn(
                name: "Rounds",
                table: "Games",
                newName: "TotalRounds");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Themes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AlbumCoverBig",
                table: "Songs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AlbumCoverSmall",
                table: "Songs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AlbumName",
                table: "Songs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviewUrl",
                table: "Songs",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Rounds",
                type: "text",
                nullable: false,
                defaultValue: "Submitting",
                oldClrType: typeof(int),
                oldType: "integer",
                oldDefaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "PlayerScoreId",
                table: "PlayerScores",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "CurrentRound",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlayerScores",
                table: "PlayerScores",
                column: "PlayerScoreId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerScores_GameId",
                table: "PlayerScores",
                column: "GameId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_PlayerScores",
                table: "PlayerScores");

            migrationBuilder.DropIndex(
                name: "IX_PlayerScores_GameId",
                table: "PlayerScores");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Themes");

            migrationBuilder.DropColumn(
                name: "AlbumCoverBig",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "AlbumCoverSmall",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "AlbumName",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "PreviewUrl",
                table: "Songs");

            migrationBuilder.DropColumn(
                name: "PlayerScoreId",
                table: "PlayerScores");

            migrationBuilder.DropColumn(
                name: "CurrentRound",
                table: "Games");

            migrationBuilder.RenameColumn(
                name: "TotalRounds",
                table: "Games",
                newName: "Rounds");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Rounds",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "Submitting");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlayerScores",
                table: "PlayerScores",
                columns: new[] { "GameId", "UserId" });
        }
    }
}
