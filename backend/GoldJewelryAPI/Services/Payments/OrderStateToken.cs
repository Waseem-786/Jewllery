using System.Security.Cryptography;
using System.Text;
using GoldJewelryAPI.Models;

namespace GoldJewelryAPI.Services.Payments
{
    /// <summary>
    /// Deterministic HMAC-derived token tied to a specific order. Used as a
    /// `state` parameter on PayFast SUCCESS/FAILURE URLs so the callback
    /// handler can reject any inbound request that wasn't initiated through
    /// our checkout. Verifies origin without needing PayFast-specific
    /// signature math (which their docs don't fully document).
    /// </summary>
    public static class OrderStateToken
    {
        public static string Compute(Order order, string securedKey)
        {
            var payload = $"{order.Id}|{order.UserId}|{order.CreatedAt.Ticks}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(securedKey));
            var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            // URL-safe base64, no padding
            return Convert.ToBase64String(bytes)
                .Replace('+', '-').Replace('/', '_').TrimEnd('=');
        }

        public static bool Verify(Order order, string securedKey, string? candidate)
        {
            if (string.IsNullOrEmpty(candidate)) return false;
            var expected = Compute(order, securedKey);
            // Constant-time compare
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expected),
                Encoding.UTF8.GetBytes(candidate));
        }
    }
}
