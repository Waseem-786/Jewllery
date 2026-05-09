using GoldJewelryAPI.Data;
using GoldJewelryAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GoldJewelryAPI.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Apply pending migrations
            await context.Database.MigrateAsync();

            // Seed Categories
            if (!await context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new() { Name = "Rings", Description = "Elegant rings crafted with the finest gold and gems", ImageUrl = "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400" },
                    new() { Name = "Necklaces", Description = "Stunning necklaces for every occasion", ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400" },
                    new() { Name = "Earrings", Description = "Beautiful earrings to complement any outfit", ImageUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400" },
                    new() { Name = "Bracelets", Description = "Exquisite bracelets for the discerning collector", ImageUrl = "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400" },
                    new() { Name = "Pendants", Description = "Timeless pendants with intricate designs", ImageUrl = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400" }
                };
                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            // Seed Products
            if (!await context.Products.AnyAsync())
            {
                var ringsCatId = (await context.Categories.FirstAsync(c => c.Name == "Rings")).Id;
                var necklacesCatId = (await context.Categories.FirstAsync(c => c.Name == "Necklaces")).Id;
                var earringsCatId = (await context.Categories.FirstAsync(c => c.Name == "Earrings")).Id;
                var braceletsCatId = (await context.Categories.FirstAsync(c => c.Name == "Bracelets")).Id;
                var pendantsCatId = (await context.Categories.FirstAsync(c => c.Name == "Pendants")).Id;

                var products = new List<Product>
                {
                    // Rings
                    new() { Name = "Royal Solitaire Ring", Description = "A timeless 22K gold solitaire ring featuring a brilliant-cut diamond centerpiece, perfect for engagements and special occasions.", Price = 125000, Stock = 10, Weight = 5.2, Material = "22K Gold", Purity = "22K", Badge = "ROYAL", Features = new() { "22K Gold", "Certified Diamond", "Handcrafted Finish" }, IsFeatured = true, CategoryId = ringsCatId, ImageUrl = "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400" },
                    new() { Name = "Floral Gold Ring", Description = "Delicately crafted 18K gold ring with a floral pattern adorned with ruby stones.", Price = 45000, Stock = 20, Weight = 3.8, Material = "18K Gold", Purity = "18K", Badge = "PREMIUM", Features = new() { "18K Gold", "Ruby Accents", "Floral Pattern" }, IsFeatured = true, CategoryId = ringsCatId, ImageUrl = "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400" },
                    new() { Name = "Classic Band Ring", Description = "A simple yet stunning 22K gold band ring, a wardrobe essential for everyday elegance.", Price = 28000, Stock = 35, Weight = 4.1, Material = "22K Gold", Purity = "22K", Badge = "SIGNATURE", Features = new() { "22K Gold", "Comfort Fit", "Polished Finish" }, IsFeatured = false, CategoryId = ringsCatId, ImageUrl = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400" },
                    new() { Name = "Emerald Crown Ring", Description = "Majestic 18K gold ring with a central emerald surrounded by a halo of diamonds.", Price = 195000, Stock = 5, Weight = 6.0, Material = "18K Gold", Purity = "18K", Badge = "ROYAL", Features = new() { "18K Gold", "Natural Emerald", "Diamond Halo" }, IsFeatured = true, CategoryId = ringsCatId, ImageUrl = "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400" },

                    // Necklaces
                    new() { Name = "Pearl Strand Necklace", Description = "Lustrous freshwater pearl strand set in 22K gold clasps, radiating timeless elegance.", Price = 85000, Stock = 12, Weight = 18.5, Material = "22K Gold & Pearls", Purity = "22K", Badge = "PREMIUM", Features = new() { "22K Gold Clasp", "Freshwater Pearls", "Timeless Design" }, IsFeatured = true, CategoryId = necklacesCatId, ImageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400" },
                    new() { Name = "Gold Chain Necklace", Description = "Classic 22K Cuban link gold chain necklace, a statement piece for any occasion.", Price = 65000, Stock = 18, Weight = 22.0, Material = "22K Gold", Purity = "22K", Badge = "SIGNATURE", Features = new() { "22K Gold", "Cuban Link", "Statement Piece" }, IsFeatured = false, CategoryId = necklacesCatId, ImageUrl = "https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?w=400" },
                    new() { Name = "Layered Boho Necklace", Description = "Trendy 18K gold layered necklace with moon and star charms for the modern woman.", Price = 38000, Stock = 25, Weight = 8.3, Material = "18K Gold", Purity = "18K", Badge = "PREMIUM", Features = new() { "18K Gold", "Layered Style", "Moon & Star Charms" }, IsFeatured = false, CategoryId = necklacesCatId, ImageUrl = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400" },

                    // Earrings
                    new() { Name = "Diamond Drop Earrings", Description = "Elegant 18K gold drop earrings featuring pear-shaped diamond drops that catch the light beautifully.", Price = 110000, Stock = 8, Weight = 4.5, Material = "18K Gold", Purity = "18K", Badge = "ROYAL", Features = new() { "18K Gold", "Pear-Cut Diamonds", "Brilliant Sparkle" }, IsFeatured = true, CategoryId = earringsCatId, ImageUrl = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400" },
                    new() { Name = "Gold Hoop Earrings", Description = "Classic 22K gold hoop earrings with a high-polish finish, versatile for any look.", Price = 22000, Stock = 40, Weight = 5.0, Material = "22K Gold", Purity = "22K", Badge = "SIGNATURE", Features = new() { "22K Gold", "High-Polish Finish", "Versatile Design" }, IsFeatured = false, CategoryId = earringsCatId, ImageUrl = "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400" },
                    new() { Name = "Ruby Stud Earrings", Description = "Brilliant ruby studs set in 22K gold, offering a pop of vibrant color.", Price = 55000, Stock = 15, Weight = 2.8, Material = "22K Gold & Ruby", Purity = "22K", Badge = "PREMIUM", Features = new() { "22K Gold", "Natural Ruby", "Skin Safe" }, IsFeatured = true, CategoryId = earringsCatId, ImageUrl = "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400" },
                    new() { Name = "Chandelier Earrings", Description = "Ornate 18K gold chandelier earrings with intricate filigree work for grand occasions.", Price = 78000, Stock = 10, Weight = 9.2, Material = "18K Gold", Purity = "18K", Badge = "ROYAL", Features = new() { "18K Gold", "Filigree Work", "Statement Piece" }, IsFeatured = false, CategoryId = earringsCatId, ImageUrl = "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400" },

                    // Bracelets
                    new() { Name = "Tennis Bracelet", Description = "Sparkling 18K gold tennis bracelet with a continuous line of round-cut diamonds.", Price = 320000, Stock = 3, Weight = 12.0, Material = "18K Gold", Purity = "18K", Badge = "ROYAL", Features = new() { "18K Gold", "Round-Cut Diamonds", "Continuous Line" }, IsFeatured = true, CategoryId = braceletsCatId, ImageUrl = "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400" },
                    new() { Name = "Bangle Set", Description = "Set of 4 handcrafted 22K gold bangles with traditional engraved patterns.", Price = 95000, Stock = 20, Weight = 40.0, Material = "22K Gold", Purity = "22K", Badge = "PREMIUM", Features = new() { "22K Gold", "Set of 4", "Hand Engraved" }, IsFeatured = true, CategoryId = braceletsCatId, ImageUrl = "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400" },
                    new() { Name = "Charm Bracelet", Description = "Playful 18K gold chain bracelet with customizable charms for a personal touch.", Price = 42000, Stock = 30, Weight = 7.5, Material = "18K Gold", Purity = "18K", Badge = "SIGNATURE", Features = new() { "18K Gold", "Customizable Charms", "Lightweight" }, IsFeatured = false, CategoryId = braceletsCatId, ImageUrl = "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400" },

                    // Pendants
                    new() { Name = "Heart Locket Pendant", Description = "Romantic 22K gold heart-shaped locket pendant, perfect for keeping a treasured memory close.", Price = 32000, Stock = 22, Weight = 4.2, Material = "22K Gold", Purity = "22K", Badge = "PREMIUM", Features = new() { "22K Gold", "Locket Design", "Romantic Style" }, IsFeatured = true, CategoryId = pendantsCatId, ImageUrl = "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400" },
                    new() { Name = "Hamsa Hand Pendant", Description = "Spiritual 22K gold Hamsa (Hand of Fatima) pendant, a symbol of protection and good fortune.", Price = 28000, Stock = 18, Weight = 3.5, Material = "22K Gold", Purity = "22K", Badge = "SIGNATURE", Features = new() { "22K Gold", "Hamsa Symbol", "Spiritual Design" }, IsFeatured = false, CategoryId = pendantsCatId, ImageUrl = "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400" }
                };

                await context.Products.AddRangeAsync(products);
                await context.SaveChangesAsync();
            }

            // Seed Admin User
            if (!await context.Users.AnyAsync(u => u.Role == "Admin"))
            {
                var admin = new User
                {
                    FullName = "Admin",
                    Email = "admin@goldjewelry.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "Admin"
                };
                await context.Users.AddAsync(admin);
                await context.SaveChangesAsync();
            }
        }
    }
}
