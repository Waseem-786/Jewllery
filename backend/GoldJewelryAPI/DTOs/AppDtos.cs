using System.ComponentModel.DataAnnotations;

namespace GoldJewelryAPI.DTOs
{
    public class RegisterDto
    {
        [Required, StringLength(120, MinimumLength = 2)]
        public string FullName { get; set; } = string.Empty;
        [Required, EmailAddress, StringLength(160)]
        public string Email { get; set; } = string.Empty;
        [Required, StringLength(120, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public double Weight { get; set; }
        public string Material { get; set; } = string.Empty;
        public string Purity { get; set; } = string.Empty;
        public string Badge { get; set; } = string.Empty;
        public List<string> Features { get; set; } = new();
        public bool IsFeatured { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public double Weight { get; set; }
        public string Material { get; set; } = string.Empty;
        public string Purity { get; set; } = string.Empty;
        public string Badge { get; set; } = string.Empty;
        public List<string> Features { get; set; } = new();
        public bool IsFeatured { get; set; }
        public int CategoryId { get; set; }
    }

    public class UpdateProductDto : CreateProductDto { }

    public class ImageUploadResponseDto
    {
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ProductCount { get; set; }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateCategoryDto : CreateCategoryDto { }

    public class PlaceOrderDto
    {
        [Required, StringLength(500, MinimumLength = 5)]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required, MinLength(1)]
        public List<OrderItemDto> Items { get; set; } = new();

        // Customer details captured on the checkout form. Payment is always
        // PayFast — the gateway handles cards, mobile wallets, and bank channels.
        [Required, StringLength(120, MinimumLength = 2)]
        public string CustomerName  { get; set; } = string.Empty;
        [Required, EmailAddress, StringLength(160)]
        public string CustomerEmail { get; set; } = string.Empty;
        [Required, StringLength(40, MinimumLength = 7)]
        public string CustomerPhone { get; set; } = string.Empty;
    }

    public class OrderItemDto
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }
        [Range(1, 1000)]
        public int Quantity { get; set; }
    }

    public class OrderResponseDto
    {
        public int Id { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<OrderItemResponseDto> Items { get; set; } = new();

        // Payment surface
        public string PaymentMethod      { get; set; } = string.Empty;
        public string PaymentStatus      { get; set; } = string.Empty;
        public string? PaymentProvider   { get; set; }
        public string? PaymentReference  { get; set; }
        public string? PaymentRedirectUrl { get; set; }
        public DateTime? PaidAt          { get; set; }
    }

    public class OrderItemResponseDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductImage { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal => Quantity * UnitPrice;
    }

    // ─── Admin DTOs ──────────────────────────────────────────────────────────
    public class AdminOrderDto : OrderResponseDto
    {
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public int ItemCount { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty; // Pending | Processing | Shipped | Delivered | Cancelled
    }

    public class AdminUserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int OrderCount { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime? LastOrderAt { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalOrders { get; set; }
        public int TotalUsers { get; set; }
        public int TotalProducts { get; set; }
        public int TotalCategories { get; set; }
        public decimal TotalRevenue { get; set; }      // Paid orders
        public decimal PendingRevenue { get; set; }    // Not yet paid
        public int LowStockCount { get; set; }
        public int OrdersLast7Days { get; set; }
        public decimal RevenueLast7Days { get; set; }

        public Dictionary<string, int> OrderStatusCounts { get; set; } = new();
        public Dictionary<string, int> PaymentStatusCounts { get; set; } = new();

        public List<DailyRevenuePointDto> RevenueSeries { get; set; } = new();
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<AdminOrderDto> RecentOrders { get; set; } = new();
        public List<LowStockProductDto> LowStockProducts { get; set; } = new();
    }

    public class DailyRevenuePointDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int QuantitySold { get; set; }
        public decimal Revenue { get; set; }
    }

    public class LowStockProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
