using GoldJewelryAPI.Data;
using GoldJewelryAPI.Services.Payments;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GoldJewelryAPI.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PaymentProviderRegistry _registry;
        private readonly PayFastCheckoutService _payfast;
        private readonly IConfiguration _config;

        public PaymentsController(
            AppDbContext context,
            PaymentProviderRegistry registry,
            PayFastCheckoutService payfast,
            IConfiguration config)
        {
            _context = context;
            _registry = registry;
            _payfast = payfast;
            _config = config;
        }

        /// <summary>
        /// Renders the auto-submitting form that POSTs the customer's browser
        /// to PayFast's hosted checkout page. The frontend redirects here once
        /// the order has been created.
        /// </summary>
        [HttpGet("payfast/checkout/{orderId:int}")]
        public async Task<IActionResult> PayFastCheckout(int orderId)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return NotFound();

            // We don't store full customer info on the order; pull from the user
            // record as a best-effort fallback.
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == order.UserId);
            var email = user?.Email ?? "";
            var name  = user?.FullName ?? "Customer";

            string html;
            try
            {
                html = await _payfast.BuildCheckoutFormAsync(order, email, customerPhone: "", customerName: name);
            }
            catch (InvalidOperationException ex)
            {
                return Content(
                    $"<h2>PayFast not configured</h2><p>{System.Net.WebUtility.HtmlEncode(ex.Message)}</p>",
                    "text/html");
            }

            return Content(html, "text/html");
        }

        /// <summary>
        /// PayFast POSTs (or redirects with) err_code, basket_id, transaction_id
        /// here once the customer finishes payment. We:
        ///   1. Verify the per-order `state` token we attached to SUCCESS/FAILURE URL
        ///      (rejects forged callbacks from anyone who didn't go through our checkout).
        ///   2. Resolve the order, ask the provider to interpret err_code, persist the result.
        ///   3. Redirect the customer's browser to the frontend success/failure page.
        /// </summary>
        [HttpPost("callback/payfast")]
        [HttpGet ("callback/payfast")]
        public async Task<IActionResult> PayFastCallback()
        {
            var payload = CollectPayload();
            var frontend = (_config["APP_FRONTEND_URL"] ?? "http://localhost:4200").TrimEnd('/');

            if (!int.TryParse(payload.GetValueOrDefault("orderId"), out var hintedId) || hintedId <= 0)
                return BadRequest(new { message = "Missing orderId." });

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == hintedId);
            if (order == null) return NotFound();

            var securedKey = _config["PAYFAST_SECURED_KEY"];
            if (string.IsNullOrWhiteSpace(securedKey))
                return StatusCode(500, new { message = "Server PayFast secured key not configured." });

            var providedState = payload.GetValueOrDefault("state");
            if (!OrderStateToken.Verify(order, securedKey, providedState))
                return Unauthorized(new { message = "Callback state mismatch — request rejected." });

            // basket_id (PayFast field) must match the order id we resolved.
            // Defends against a request that has a valid state for one order
            // but tries to flip a different one.
            if (payload.TryGetValue("basket_id", out var basket) &&
                int.TryParse(basket, out var basketId) &&
                basketId != order.Id)
                return BadRequest(new { message = "basket_id does not match order." });

            var provider = _registry.Resolve("PayFast");
            var result   = await provider.HandleCallbackAsync(payload);

            order.PaymentStatus    = result.PaymentStatus;
            order.PaymentReference = result.Reference;
            if (result.PaymentStatus == "Paid")
            {
                order.PaidAt = DateTime.UtcNow;
                order.Status = "Processing";
            }
            else if (result.PaymentStatus == "Failed")
            {
                order.Status = "Cancelled";
            }
            await _context.SaveChangesAsync();

            var route = result.PaymentStatus == "Paid" ? "success" : "failure";
            return Redirect($"{frontend}/order/{route}/{order.Id}");
        }

        private Dictionary<string, string> CollectPayload()
        {
            var payload = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var kvp in Request.Query)
                payload[kvp.Key] = kvp.Value.ToString();

            if (Request.HasFormContentType)
            {
                foreach (var kvp in Request.Form)
                    payload[kvp.Key] = kvp.Value.ToString();
            }

            return payload;
        }
    }
}
