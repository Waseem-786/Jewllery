using GoldJewelryAPI.Data;
using GoldJewelryAPI.DTOs;
using GoldJewelryAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoldJewelryAPI.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private static readonly string[] AllowedOrderStatuses =
            { "Pending", "Processing", "Shipped", "Delivered", "Cancelled" };

        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // ─── Dashboard ──────────────────────────────────────────────────────────
        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardStatsDto>> Dashboard()
        {
            var now = DateTime.UtcNow;
            var sevenDaysAgo = now.AddDays(-7);
            var fourteenDaysAgo = now.AddDays(-14).Date;

            var orders = await _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.User)
                .ToListAsync();

            var totalRevenue   = orders.Where(o => o.PaymentStatus == "Paid").Sum(o => o.TotalAmount);
            var pendingRevenue = orders.Where(o => o.PaymentStatus != "Paid" && o.Status != "Cancelled").Sum(o => o.TotalAmount);

            var orderStatusCounts = AllowedOrderStatuses
                .ToDictionary(s => s, s => orders.Count(o => o.Status == s));

            var paymentStatusCounts = orders
                .GroupBy(o => string.IsNullOrWhiteSpace(o.PaymentStatus) ? "Unknown" : o.PaymentStatus)
                .ToDictionary(g => g.Key, g => g.Count());

            // Revenue series: last 14 days, including empty days.
            var revenueSeries = Enumerable.Range(0, 14)
                .Select(i => fourteenDaysAgo.AddDays(i))
                .Select(date =>
                {
                    var dayOrders = orders.Where(o =>
                        o.PaymentStatus == "Paid" &&
                        o.PaidAt.HasValue &&
                        o.PaidAt.Value.Date == date).ToList();
                    return new DailyRevenuePointDto
                    {
                        Date = date,
                        Revenue = dayOrders.Sum(o => o.TotalAmount),
                        Orders = dayOrders.Count
                    };
                })
                .ToList();

            // Top products by quantity sold
            var topProducts = orders
                .SelectMany(o => o.OrderItems)
                .GroupBy(oi => new { oi.ProductId, oi.Product?.Name, oi.Product?.ImageUrl })
                .Select(g => new TopProductDto
                {
                    ProductId    = g.Key.ProductId,
                    Name         = g.Key.Name ?? "Unknown",
                    ImageUrl     = g.Key.ImageUrl ?? "",
                    QuantitySold = g.Sum(x => x.Quantity),
                    Revenue      = g.Sum(x => x.Quantity * x.UnitPrice)
                })
                .OrderByDescending(p => p.QuantitySold)
                .Take(5)
                .ToList();

            var recentOrders = orders
                .OrderByDescending(o => o.CreatedAt)
                .Take(5)
                .Select(MapAdminOrder)
                .ToList();

            var lowStock = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.Stock <= 5)
                .OrderBy(p => p.Stock)
                .Take(10)
                .Select(p => new LowStockProductDto
                {
                    Id           = p.Id,
                    Name         = p.Name,
                    ImageUrl     = p.ImageUrl,
                    Stock        = p.Stock,
                    CategoryName = p.Category!.Name
                })
                .ToListAsync();

            var stats = new DashboardStatsDto
            {
                TotalOrders         = orders.Count,
                TotalUsers          = await _context.Users.CountAsync(),
                TotalProducts       = await _context.Products.CountAsync(),
                TotalCategories     = await _context.Categories.CountAsync(),
                TotalRevenue        = totalRevenue,
                PendingRevenue      = pendingRevenue,
                LowStockCount       = await _context.Products.CountAsync(p => p.Stock <= 5),
                OrdersLast7Days     = orders.Count(o => o.CreatedAt >= sevenDaysAgo),
                RevenueLast7Days    = orders.Where(o => o.PaymentStatus == "Paid" && o.PaidAt >= sevenDaysAgo).Sum(o => o.TotalAmount),
                OrderStatusCounts   = orderStatusCounts,
                PaymentStatusCounts = paymentStatusCounts,
                RevenueSeries       = revenueSeries,
                TopProducts         = topProducts,
                RecentOrders        = recentOrders,
                LowStockProducts    = lowStock
            };

            return Ok(stats);
        }

        // ─── Orders ─────────────────────────────────────────────────────────────
        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<AdminOrderDto>>> AllOrders([FromQuery] string? status, [FromQuery] string? search)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
                query = query.Where(o => o.Status == status);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(o =>
                    (o.User != null && (o.User.Email.ToLower().Contains(term) || o.User.FullName.ToLower().Contains(term))) ||
                    o.Id.ToString().Contains(term) ||
                    (o.PaymentReference != null && o.PaymentReference.ToLower().Contains(term)));
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders.Select(MapAdminOrder));
        }

        [HttpPatch("orders/{id:int}/status")]
        public async Task<ActionResult<AdminOrderDto>> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (!AllowedOrderStatuses.Contains(dto.Status))
                return BadRequest(new { message = $"Status must be one of: {string.Join(", ", AllowedOrderStatuses)}." });

            var order = await _context.Orders
                .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            order.Status = dto.Status;

            // Useful side-effect: marking Delivered also flips PaymentStatus to Paid
            // for cash-on-delivery style flows. PayFast already paid orders stay Paid.
            if (dto.Status == "Delivered" && order.PaymentStatus != "Paid")
            {
                order.PaymentStatus = "Paid";
                order.PaidAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(MapAdminOrder(order));
        }

        // ─── Users ──────────────────────────────────────────────────────────────
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<AdminUserDto>>> AllUsers()
        {
            var users = await _context.Users
                .Select(u => new AdminUserDto
                {
                    Id          = u.Id,
                    FullName    = u.FullName,
                    Email       = u.Email,
                    Role        = u.Role,
                    CreatedAt   = u.CreatedAt,
                    OrderCount  = u.Orders.Count,
                    TotalSpent  = u.Orders.Where(o => o.PaymentStatus == "Paid").Sum(o => (decimal?)o.TotalAmount) ?? 0,
                    LastOrderAt = u.Orders.OrderByDescending(o => o.CreatedAt).Select(o => (DateTime?)o.CreatedAt).FirstOrDefault()
                })
                .OrderByDescending(u => u.TotalSpent)
                .ToListAsync();

            return Ok(users);
        }

        // ─── Mapping ────────────────────────────────────────────────────────────
        private static AdminOrderDto MapAdminOrder(Order order) => new()
        {
            Id                 = order.Id,
            TotalAmount        = order.TotalAmount,
            Status             = order.Status,
            ShippingAddress    = order.ShippingAddress,
            CreatedAt          = order.CreatedAt,
            PaymentMethod      = order.PaymentMethod,
            PaymentStatus      = order.PaymentStatus,
            PaymentProvider    = order.PaymentProvider,
            PaymentReference   = order.PaymentReference,
            PaymentRedirectUrl = order.PaymentRedirectUrl,
            PaidAt             = order.PaidAt,
            UserId             = order.UserId,
            CustomerName       = order.User?.FullName ?? "",
            CustomerEmail      = order.User?.Email ?? "",
            ItemCount          = order.OrderItems.Sum(oi => oi.Quantity),
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                ProductId    = oi.ProductId,
                ProductName  = oi.Product?.Name ?? "",
                ProductImage = oi.Product?.ImageUrl ?? "",
                Quantity     = oi.Quantity,
                UnitPrice    = oi.UnitPrice
            }).ToList()
        };
    }
}
