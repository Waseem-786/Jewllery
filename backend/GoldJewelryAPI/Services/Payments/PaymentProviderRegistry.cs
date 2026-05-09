namespace GoldJewelryAPI.Services.Payments
{
    /// <summary>Resolves an IPaymentProvider by its Method (currently only "PayFast").</summary>
    public class PaymentProviderRegistry
    {
        private readonly Dictionary<string, IPaymentProvider> _providers;

        public PaymentProviderRegistry(IEnumerable<IPaymentProvider> providers)
        {
            _providers = providers.ToDictionary(p => p.Method, StringComparer.OrdinalIgnoreCase);
        }

        public IPaymentProvider Resolve(string method)
        {
            if (!_providers.TryGetValue(method, out var p))
                throw new ArgumentException($"Unsupported payment method '{method}'.");
            return p;
        }

        public IEnumerable<string> SupportedMethods => _providers.Keys;
    }
}
