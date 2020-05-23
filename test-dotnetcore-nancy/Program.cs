using System;
using System.Diagnostics;
using Nancy;
using Nancy.Hosting.Self;
using System.Collections.Generic;
using JWT.Builder;
using JWT.Algorithms;
using System.IO;

namespace csharp
{
    public class JwtController : Nancy.NancyModule
    {
        public JwtController()
        {
            Get("/json-generate", async args =>
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
            });

            Get("/index.html", args =>
            {
                return "<html><head><title></title></head><body><h1>It works!</h1></body></html>";
            });

            Get("/file_read_rfc2616.txt", args =>
            {
                return File.ReadAllText("./html/rfc2616.txt");
            });

            Get("/rfc2616.txt", args =>
            {
                return File.ReadAllText("./html/rfc2616.txt");
            });

            Get("/file_read_rfc7523.txt", args =>
            {
                return File.ReadAllText("./html/rfc7523.txt");
            });

            Get("/rfc7523.txt", args =>
            {
                return File.ReadAllText("./html/rfc7523.txt");
            });

            Get("/info", args =>
            {
                return "test-dotnetcore-nancy";
            });
        }

    }

    class Program
    {
        static void Main(string[] args)
        {
            using(var host = new NancyHost(new Uri("http://localhost:8080")))
            {

                host.Start();
                Console.WriteLine( "Running on http://localhost:8080" );
                while (true) {
                    Console.ReadLine();
                }
            }
        }
    }
}
