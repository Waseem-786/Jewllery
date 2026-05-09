using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoldJewelryAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddProductBadgeAndFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Badge",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Features",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Badge",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Features",
                table: "Products");
        }
    }
}
