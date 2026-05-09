namespace GoldJewelryAPI.Configuration
{
    /// <summary>
    /// Minimal .env file loader. Reads KEY=VALUE pairs and pushes them into
    /// the process environment, so the standard ASP.NET Core
    /// <c>AddEnvironmentVariables()</c> picks them up. Avoids a NuGet dep.
    /// </summary>
    public static class DotEnv
    {
        public static void Load(string path)
        {
            if (!File.Exists(path)) return;

            foreach (var raw in File.ReadAllLines(path))
            {
                var line = raw.Trim();
                if (line.Length == 0 || line.StartsWith('#')) continue;

                var eq = line.IndexOf('=');
                if (eq <= 0) continue;

                var key = line[..eq].Trim();
                var value = line[(eq + 1)..].Trim();

                // Strip a single layer of surrounding quotes if present
                if (value.Length >= 2 &&
                    ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
                {
                    value = value[1..^1];
                }

                // Don't override values already set in the real environment
                if (Environment.GetEnvironmentVariable(key) is null)
                    Environment.SetEnvironmentVariable(key, value);
            }
        }
    }
}
