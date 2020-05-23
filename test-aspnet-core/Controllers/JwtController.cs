using System;
using Microsoft.AspNetCore.Mvc;
using JWT.Builder;
using JWT.Algorithms;

namespace csharp_test.Controllers
{
    [ApiController]
    [Route("")]
    public class JwtController : ControllerBase
    {

        [HttpGet("json-generate")]
        public string Get()
        {
            var token = new JwtBuilder()
                .WithAlgorithm(new HMACSHA256Algorithm())
                .WithSecret("lua-resty-jwt")
                .AddClaim("iat", DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds())
                .AddClaim("name", "customer1")
                .AddClaim("id", "a7c7de38-6755-49d8-91d8-b812630abd65")
                .AddClaim("tenant", "mytenant")
                .Encode();

            return token;
        }
    }
}