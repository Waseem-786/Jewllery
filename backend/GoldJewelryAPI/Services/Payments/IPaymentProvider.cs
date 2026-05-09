using GoldJewelryAPI.Models;

namespace GoldJewelryAPI.Services.Payments
{
    /// <summary>
    /// One implementation per supported payment method. Currently only PayFast
    /// (which itself fans out to cards, JazzCash, Easypaisa, and bank channels
    /// on the hosted page). New methods can be added by registering another
    /// IPaymentProvider in Program.cs.
    /// </summary>
    public interface IPaymentProvider
    {
        /// <summary>Identifier used to match Order.PaymentMethod.</summary>
        string Method { get; }

        /// <summary>
        /// Kick off payment for an order. May:
        ///  - finalise immediately (COD)
        ///  - return a redirect URL the client should open (hosted page providers)
        ///  - return a status string for polling (server-to-server providers)
        /// </summary>
        Task<PaymentInitiationResult> InitiateAsync(Order order, PaymentRequest request);

        /// <summary>
        /// Verify the callback/webhook signature from the provider and return the
        /// final status. Stubbed implementations just trust the payload — replace
        /// with HMAC verification when real keys are added.
        /// </summary>
        Task<PaymentCallbackResult> HandleCallbackAsync(IDictionary<string, string> payload);
    }

    public record PaymentRequest(
        string CustomerName,
        string CustomerEmail,
        string CustomerPhone
    );

    public record PaymentInitiationResult(
        string PaymentStatus,        // Pending | AwaitingProvider | Paid | Failed
        string? RedirectUrl,         // Hosted-page URL the browser should follow
        string Reference,            // Provider txn id (or stub)
        string Provider              // PayFast
    );

    public record PaymentCallbackResult(
        int OrderId,
        string PaymentStatus,        // Paid | Failed
        string Reference
    );

    internal static class PayloadExtensions
    {
        public static string ValueOrEmpty(this IDictionary<string, string> dict, string key)
            => dict.TryGetValue(key, out var v) ? v : string.Empty;
    }
}
