using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using GoldJewelryAPI.Models;

namespace GoldJewelryAPI.Services.Payments
{
    /// <summary>
    /// Server-side helper that talks to PayFast Pakistan's GetAccessToken
    /// endpoint and produces the auto-submitting HTML form that the
    /// customer's browser POSTs to PostTransaction.
    ///
    /// Kept separate from <see cref="PayFastProvider"/> because it needs an
    /// <see cref="HttpClient"/> and is only invoked from the redirect
    /// controller (the IPaymentProvider abstraction stays HTTP-free).
    /// </summary>
    public class PayFastCheckoutService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;

        public PayFastCheckoutService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _config = config;
        }

        public async Task<string> BuildCheckoutFormAsync(Order order, string customerEmail, string customerPhone, string customerName)
        {
            var merchantId   = Required("PAYFAST_MERCHANT_ID");
            var securedKey   = Required("PAYFAST_SECURED_KEY");
            var merchantName = _config["PAYFAST_MERCHANT_NAME"] ?? "Merchant";
            var tokenUrl     = Required("PAYFAST_TOKEN_API_URL");
            var redirectUrl  = Required("PAYFAST_REDIRECT_URL");
            var currency     = _config["PAYFAST_CURRENCY"] ?? "PKR";
            var backendBase  = (_config["APP_BACKEND_URL"] ?? "http://localhost:5000").TrimEnd('/');

            var basketId = order.Id.ToString(CultureInfo.InvariantCulture);
            var txnAmt   = order.TotalAmount.ToString("0.00", CultureInfo.InvariantCulture);

            // ── Step 1: GetAccessToken ────────────────────────────────────────
            var tokenForm = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["MERCHANT_ID"]   = merchantId,
                ["SECURED_KEY"]   = securedKey,
                ["BASKET_ID"]     = basketId,
                ["TXNAMT"]        = txnAmt,
                ["CURRENCY_CODE"] = currency,
            });

            using var tokenReq = new HttpRequestMessage(HttpMethod.Post, tokenUrl) { Content = tokenForm };
            tokenReq.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var tokenResp = await _http.SendAsync(tokenReq);
            var tokenBody = await tokenResp.Content.ReadAsStringAsync();
            tokenResp.EnsureSuccessStatusCode();

            var token = ExtractToken(tokenBody);
            if (string.IsNullOrWhiteSpace(token))
                throw new InvalidOperationException($"PayFast did not return an ACCESS_TOKEN. Body: {tokenBody}");

            // ── Step 2: build hosted-checkout auto-submit form ────────────────
            // SIGNATURE: md5(merchant_id:merchant_name:amount:basket_id) — per PayFast PHP samples.
            var signature = Md5($"{merchantId}:{merchantName}:{txnAmt}:{basketId}");

            // Per-order state token: PayFast preserves URL query params on its
            // redirect back, so any callback that doesn't carry this exact
            // value cannot have been initiated via our own checkout flow.
            // Computed deterministically from server-only data so we don't
            // need to persist a separate column.
            var state = OrderStateToken.Compute(order, securedKey);
            var successUrl = $"{backendBase}/api/payments/callback/payfast?orderId={order.Id}&result=success&state={state}";
            var failureUrl = $"{backendBase}/api/payments/callback/payfast?orderId={order.Id}&result=failure&state={state}";

            var fields = new Dictionary<string, string>
            {
                ["MERCHANT_ID"]            = merchantId,
                ["MERCHANT_NAME"]          = merchantName,
                ["TOKEN"]                  = token!,
                ["PROCCODE"]               = "00",
                ["TXNAMT"]                 = txnAmt,
                ["CUSTOMER_MOBILE_NO"]     = customerPhone ?? "",
                ["CUSTOMER_EMAIL_ADDRESS"] = customerEmail ?? "",
                ["SIGNATURE"]              = signature,
                ["VERSION"]                = "MERCHANT-CART-0.1",
                ["TXNDESC"]                = $"Order #{order.Id} at {merchantName}",
                ["SUCCESS_URL"]            = successUrl,
                ["FAILURE_URL"]            = failureUrl,
                ["CHECKOUT_URL"]           = successUrl,
                ["BASKET_ID"]              = basketId,
                ["ORDER_DATE"]             = order.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture),
                ["CURRENCY_CODE"]          = currency,
            };

            return BuildAutoSubmitHtml(redirectUrl, fields, merchantName);
        }

        private static string BuildAutoSubmitHtml(string action, IDictionary<string, string> fields, string merchantName)
        {
            var sb = new StringBuilder();
            sb.AppendLine("<!doctype html><html><head><meta charset=\"utf-8\"><title>Redirecting to PayFast…</title>");
            sb.AppendLine("<style>body{font-family:system-ui,-apple-system,sans-serif;background:#0b0b0b;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.box{text-align:center;padding:40px}.spinner{width:36px;height:36px;border:2px solid rgba(201,169,97,.3);border-top-color:#c9a961;border-radius:50%;animation:s 1s linear infinite;margin:0 auto 20px}@keyframes s{to{transform:rotate(360deg)}}h1{font-weight:400;letter-spacing:1px}p{color:rgba(255,255,255,.6)}</style>");
            sb.AppendLine("</head><body>");
            sb.AppendLine("<div class=\"box\"><div class=\"spinner\"></div>");
            sb.AppendLine("<h1>Redirecting to PayFast secure checkout…</h1>");
            sb.AppendLine($"<p>{System.Net.WebUtility.HtmlEncode(merchantName)} · Do not close this window.</p></div>");
            sb.Append("<form id=\"pf\" method=\"post\" action=\"").Append(System.Net.WebUtility.HtmlEncode(action)).AppendLine("\">");
            foreach (var kvp in fields)
            {
                sb.Append("<input type=\"hidden\" name=\"")
                  .Append(System.Net.WebUtility.HtmlEncode(kvp.Key))
                  .Append("\" value=\"")
                  .Append(System.Net.WebUtility.HtmlEncode(kvp.Value ?? string.Empty))
                  .AppendLine("\">");
            }
            sb.AppendLine("</form>");
            sb.AppendLine("<script>document.getElementById('pf').submit();</script>");
            sb.AppendLine("</body></html>");
            return sb.ToString();
        }

        private string Required(string key)
        {
            var v = _config[key];
            if (string.IsNullOrWhiteSpace(v))
                throw new InvalidOperationException($"PayFast configuration missing: {key}. Add it to backend/GoldJewelryAPI/.env");
            return v;
        }

        private static string? ExtractToken(string body)
        {
            // PayFast returns either a JSON object or a plain string. Be lenient.
            try
            {
                using var doc = JsonDocument.Parse(body);
                var root = doc.RootElement;
                foreach (var name in new[] { "ACCESS_TOKEN", "access_token", "AUTH_TOKEN", "token", "TOKEN" })
                {
                    if (root.ValueKind == JsonValueKind.Object &&
                        root.TryGetProperty(name, out var prop) &&
                        prop.ValueKind == JsonValueKind.String)
                    {
                        return prop.GetString();
                    }
                }

                if (root.ValueKind == JsonValueKind.String)
                    return root.GetString();
            }
            catch (JsonException)
            {
                // Plain string token
                var trimmed = body.Trim().Trim('"');
                return trimmed.Length > 0 ? trimmed : null;
            }
            return null;
        }

        private static string Md5(string input)
        {
            var bytes = MD5.HashData(Encoding.UTF8.GetBytes(input));
            var sb = new StringBuilder(bytes.Length * 2);
            foreach (var b in bytes) sb.Append(b.ToString("x2"));
            return sb.ToString();
        }
    }
}
