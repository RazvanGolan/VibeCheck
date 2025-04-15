using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VibeCheck.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddGameSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Games",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "CustomThemes",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Mode",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PlayersLimit",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 8);

            migrationBuilder.AddColumn<string>(
                name: "Privacy",
                table: "Games",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Rounds",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 5);

            migrationBuilder.AddColumn<string>(
                name: "SelectedThemeCategories",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TimePerRound",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 60);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomThemes",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Mode",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "PlayersLimit",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Privacy",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Rounds",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "SelectedThemeCategories",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "TimePerRound",
                table: "Games");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "Games",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
