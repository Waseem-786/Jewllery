namespace GoldJewelryAPI.Models
{
    public class Order
    {
        public int Id { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending"; // Pending | Processing | Shipped | Delivered | Cancelled
        public string ShippingAddress { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Payment fields — only PayFast is supported.
        public string PaymentMethod { get; set; } = "PayFast";
        public string PaymentStatus { get; set; } = "Pending";
            // Pending | AwaitingProvider | Paid | Failed | Refunded
        public string? PaymentProvider { get; set; }
            // "PayFast" once initiation completes; null beforehand.
        public string? PaymentReference { get; set; }
            // Provider's transaction id once issued
        public string? PaymentRedirectUrl { get; set; }
            // Hosted-page URL the client should redirect to (for non-COD)
        public DateTime? PaidAt { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
