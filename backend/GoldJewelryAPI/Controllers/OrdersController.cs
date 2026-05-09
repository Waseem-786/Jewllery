using GoldJewelryAPI.Data;
using GoldJewelryAPI.DTOs;
using GoldJewelryAPI.Models;
using GoldJewelryAPI.Services.Payments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Security.Claims;

namespace GoldJewelryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PaymentProviderRegistry _payments;

        public OrdersController(AppDbContext context, PaymentProviderRegistry payments)
        {
            _context = context;
            _payments = payments;
        }

        [HttpPost]
        public async Task<ActionResult<OrderResponseDto>> PlaceOrder([FromBody] PlaceOrderDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // DataAnnotations on the DTO catch most input errors via
            // [ApiController]'s automatic 400. Keep an extra defensive check
            // here in case validation is ever bypassed.
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest(new { message = "Order must have at least one item." });
            if (dto.Items.Any(i => i.Quantity <= 0))
                return BadRequest(new { message = "Quantities must be positive." });

            var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
            if (productIds.Count != dto.Items.Count)
                return BadRequest(new { message = "Duplicate product entries are not allowed; combine quantities client-side." });

            // ReadCommitted is enough — the atomic conditional UPDATE below is
            // what actually serializes concurrent stock decrements. The
            // transaction is only here so we can roll back the decrements if
            // the subsequent order insert fails.
            await using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);

            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            foreach (var item in dto.Items)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if (product == null)
                    return BadRequest(new { message = $"Product {item.ProductId} not found." });
                if (product.Stock < item.Quantity)
                    return BadRequest(new { message = $"Insufficient stock for '{product.Name}'." });
            }

            // Atomic conditional update: only decrement if Stock >= quantity.
            // If anyone else just consumed the units between read and write,
            // ExecuteUpdate returns 0 rows and we abort.
            foreach (var item in dto.Items)
            {
                var qty = item.Quantity;
                var rows = await _context.Products
                    .Where(p => p.Id == item.ProductId && p.Stock >= qty)
                    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - qty));
                if (rows == 0)
                {
                    var name = products.First(p => p.Id == item.ProductId).Name;
                    return BadRequest(new { message = $"Insufficient stock for '{name}'." });
                }
            }

            var order = new Order
            {
                UserId = userId,
                ShippingAddress = dto.ShippingAddress,
                PaymentMethod = "PayFast",
                OrderItems = dto.Items.Select(item =>
                {
                    var product = products.First(p => p.Id == item.ProductId);
                    return new OrderItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price
                    };
                }).ToList()
            };

            order.TotalAmount = order.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice);
            if (order.TotalAmount <= 0)
                return BadRequest(new { message = "Order total must be positive." });

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            // Hand off to PayFast — the redirect URL points at our backend
            // checkout endpoint which renders the auto-submit form.
            var provider = _payments.Resolve(order.PaymentMethod);
            var initiation = await provider.InitiateAsync(order, new PaymentRequest(
                CustomerName:  dto.CustomerName,
                CustomerEmail: dto.CustomerEmail,
                CustomerPhone: dto.CustomerPhone
            ));

            order.PaymentStatus      = initiation.PaymentStatus;
            order.PaymentProvider    = initiation.Provider;
            order.PaymentReference   = initiation.Reference;
            order.PaymentRedirectUrl = initiation.RedirectUrl;
            await _context.SaveChangesAsync();

            var fullOrder = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstAsync(o => o.Id == order.Id);

            return Ok(MapToDto(fullOrder));
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetMyOrders()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders.Select(MapToDto));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderResponseDto>> GetOrder(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            return order == null ? NotFound() : Ok(MapToDto(order));
        }

        private static OrderResponseDto MapToDto(Order order) => new()
        {
            Id = order.Id,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            ShippingAddress = order.ShippingAddress,
            CreatedAt = order.CreatedAt,
            PaymentMethod      = order.PaymentMethod,
            PaymentStatus      = order.PaymentStatus,
            PaymentProvider    = order.PaymentProvider,
            PaymentReference   = order.PaymentReference,
            PaymentRedirectUrl = order.PaymentRedirectUrl,
            PaidAt             = order.PaidAt,
            Items = order.OrderItems.Select(oi => new OrderItemResponseDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product?.Name ?? "",
                ProductImage = oi.Product?.ImageUrl ?? "",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        };
    }
}
