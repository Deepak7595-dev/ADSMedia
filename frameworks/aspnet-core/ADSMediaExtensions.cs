using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace ADSMedia
{
    /// <summary>
    /// Extension methods for ASP.NET Core DI
    /// </summary>
    public static class ADSMediaExtensions
    {
        /// <summary>
        /// Add ADSMedia client to DI container
        /// </summary>
        public static IServiceCollection AddADSMedia(this IServiceCollection services, IConfiguration configuration)
        {
            var apiKey = configuration["ADSMedia:ApiKey"] ?? Environment.GetEnvironmentVariable("ADSMEDIA_API_KEY");
            var fromName = configuration["ADSMedia:FromName"] ?? "ASP.NET Core";

            if (string.IsNullOrEmpty(apiKey))
            {
                throw new InvalidOperationException("ADSMedia API key not configured");
            }

            services.AddSingleton(new ADSMediaClient(apiKey, fromName));
            return services;
        }

        /// <summary>
        /// Add ADSMedia client with specific options
        /// </summary>
        public static IServiceCollection AddADSMedia(this IServiceCollection services, string apiKey, string fromName = "ASP.NET Core")
        {
            services.AddSingleton(new ADSMediaClient(apiKey, fromName));
            return services;
        }
    }
}

