namespace GoldJewelryAPI.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public double Weight { get; set; } // in grams
        public string Material { get; set; } = string.Empty; // e.g. 18K Gold, 22K Gold, Silver
        public string Purity { get; set; } = string.Empty;  // e.g. 18K, 22K, 925 Silver
        public string Badge { get; set; } = string.Empty;    // e.g. ROYAL, PREMIUM, SIGNATURE
        public List<string> Features { get; set; } = new(); // e.g. ["18K Gold", "Certified Diamond"]
        public bool IsFeatured { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
