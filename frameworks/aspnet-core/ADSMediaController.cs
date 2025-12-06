using Microsoft.AspNetCore.Mvc;

namespace ADSMedia
{
    /// <summary>
    /// ASP.NET Core Controller for ADSMedia
    /// </summary>
    [ApiController]
    [Route("api/email")]
    public class ADSMediaController : ControllerBase
    {
        private readonly ADSMediaClient _client;

        public ADSMediaController(ADSMediaClient client)
        {
            _client = client;
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody] SendEmailRequest request)
        {
            try
            {
                var result = await _client.SendAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("batch")]
        public async Task<IActionResult> SendBatch([FromBody] BatchEmailRequest request)
        {
            try
            {
                var result = await _client.SendBatchAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("check")]
        public async Task<IActionResult> CheckSuppression([FromQuery] string email)
        {
            try
            {
                var result = await _client.CheckSuppressionAsync(email);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("ping")]
        public async Task<IActionResult> Ping()
        {
            try
            {
                var result = await _client.PingAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}

