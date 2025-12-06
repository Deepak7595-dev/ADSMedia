using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ADSMedia
{
    /// <summary>
    /// ADSMedia API Client for ASP.NET Core
    /// </summary>
    public class ADSMediaClient : IDisposable
    {
        private const string ApiBaseUrl = "https://api.adsmedia.live/v1";
        private readonly HttpClient _httpClient;
        private readonly string _defaultFromName;
        private readonly JsonSerializerOptions _jsonOptions;

        public ADSMediaClient(string apiKey, string defaultFromName = "ASP.NET Core")
        {
            _defaultFromName = defaultFromName;
            _httpClient = new HttpClient { BaseAddress = new Uri(ApiBaseUrl) };
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
        }

        private async Task<ApiResponse<T>> RequestAsync<T>(HttpMethod method, string endpoint, object? body = null)
        {
            var request = new HttpRequestMessage(method, endpoint);
            
            if (body != null)
            {
                var json = JsonSerializer.Serialize(body, _jsonOptions);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();
            
            return JsonSerializer.Deserialize<ApiResponse<T>>(content, _jsonOptions)!;
        }

        /// <summary>
        /// Send a single email
        /// </summary>
        public async Task<ApiResponse<SendResult>> SendAsync(SendEmailRequest request)
        {
            request.FromName ??= _defaultFromName;
            return await RequestAsync<SendResult>(HttpMethod.Post, "/send", request);
        }

        /// <summary>
        /// Send batch emails
        /// </summary>
        public async Task<ApiResponse<BatchResult>> SendBatchAsync(BatchEmailRequest request)
        {
            request.FromName ??= _defaultFromName;
            return await RequestAsync<BatchResult>(HttpMethod.Post, "/send/batch", request);
        }

        /// <summary>
        /// Check if email is suppressed
        /// </summary>
        public async Task<ApiResponse<SuppressionResult>> CheckSuppressionAsync(string email)
        {
            return await RequestAsync<SuppressionResult>(HttpMethod.Get, $"/suppressions/check?email={email}");
        }

        /// <summary>
        /// Test API connection
        /// </summary>
        public async Task<ApiResponse<PingResult>> PingAsync()
        {
            return await RequestAsync<PingResult>(HttpMethod.Get, "/ping");
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }

    // Request/Response Models
    public class SendEmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string? ToName { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Html { get; set; } = string.Empty;
        public string? Text { get; set; }
        public string? FromName { get; set; }
        public string? ReplyTo { get; set; }
    }

    public class BatchEmailRequest
    {
        public List<Recipient> Recipients { get; set; } = new();
        public string Subject { get; set; } = string.Empty;
        public string Html { get; set; } = string.Empty;
        public string? Text { get; set; }
        public string? Preheader { get; set; }
        public string? FromName { get; set; }
    }

    public class Recipient
    {
        public string Email { get; set; } = string.Empty;
        public string? Name { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public ApiError? Error { get; set; }
    }

    public class ApiError
    {
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class SendResult
    {
        public string MessageId { get; set; } = string.Empty;
        public int SendId { get; set; }
        public string To { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class BatchResult
    {
        public string TaskId { get; set; } = string.Empty;
        public int Total { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class SuppressionResult
    {
        public string Email { get; set; } = string.Empty;
        public bool Suppressed { get; set; }
        public string? Reason { get; set; }
    }

    public class PingResult
    {
        public string Message { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }
}

