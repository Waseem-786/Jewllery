using System.Globalization;
using GoldJewelryAPI.Models;

namespace GoldJewelryAPI.Services.Payments
{
    /// <summary>
    /// PayFast (Pakistan) — accepts Visa, Mastercard, mobile wallets (JazzCash,
    /// Easypaisa) and direct bank channels via a single hosted-checkout page.
    ///
    /// Flow per https://gopayfast.com/docs/:
    ///   1. POST merchant_id, secured_key, basket_id, txnamt, currency_code to
    ///      GetAccessToken → returns ACCESS_TOKEN.
    ///   2. Browser POSTs to PostTransaction with MERCHANT_ID, MERCHANT_NAME,
    ///      TOKEN, PROCCODE, TXNAMT, CUSTOMER_*, SIGNATURE, BASKET_ID,
    ///      SUCCESS_URL, FAILURE_URL, CHECKOUT_URL.
    ///   3. PayFast redirects the browser back to SUCCESS_URL/FAILURE_URL with
    ///      err_code, basket_id, transaction_id, RESPONSE_CODE.
    ///
    /// We hand step (1) + (2) to PayFastCheckoutService (called from the
    /// controller that renders the auto-submit form). Initiate just records
    /// the redirect target; the token is fetched fresh on browser navigation
    /// because PayFast tokens are single-use.
    /// </summary>
    public class PayFastProvider : IPaymentProvider
    {
        private readonly IConfiguration _config;
        public PayFastProvider(IConfiguration config) => _config = config;

        public string Method => "PayFast";

        public Task<PaymentInitiationResult> InitiateAsync(Order order, PaymentRequest request)
        {
            var backend  = _config["APP_BACKEND_URL"] ?? "http://localhost:5000";
            var redirect = $"{backend.TrimEnd('/')}/api/payments/payfast/checkout/{order.Id}";

            var reference = $"PF-{order.Id}-{DateTime.UtcNow:yyyyMMddHHmmss}";

            return Task.FromResult(new PaymentInitiationResult(
                PaymentStatus: "AwaitingProvider",
                RedirectUrl:   redirect,
                Reference:     reference,
                Provider:      "PayFast"
            ));
        }

        public Task<PaymentCallbackResult> HandleCallbackAsync(IDictionary<string, string> payload)
        {
            // PayFast Pakistan returns err_code "000" on success.
            var errCode = payload.ValueOrEmpty("err_code");
            var success = errCode == "000" || errCode == "00";

            // BASKET_ID is the order id we sent in step 2.
            var basketId = payload.ValueOrEmpty("basket_id");
            if (!int.TryParse(basketId, out var orderId))
            {
                // Fallback: orderId may have been passed as a query hint.
                _ = int.TryParse(payload.ValueOrEmpty("orderId"), out orderId);
            }

            var reference = payload.ValueOrEmpty("transaction_id") is { Length: > 0 } txn
                ? txn
                : $"PF-{orderId.ToString(CultureInfo.InvariantCulture)}";

            return Task.FromResult(new PaymentCallbackResult(
                OrderId:       orderId,
                PaymentStatus: success ? "Paid" : "Failed",
                Reference:     reference
            ));
        }
    }
}
