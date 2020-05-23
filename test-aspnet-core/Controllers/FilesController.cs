using Microsoft.AspNetCore.Mvc;

namespace csharp_test.Controllers
{
    [ApiController]
    [Route("")]
    public class FilesController : ControllerBase
    {

        [HttpGet("index.html")]
        public string GetIndex()
        {
            return "<html><head><title></title></head><body><h1>It works!</h1></body></html>";
        }

        [HttpGet("info")]
        public string GetInfo()
        {
            return "test-aspnet-core";
        }

        [HttpGet("file_read_rfc2616.txt")]
        public string GetFileReadRfc2616()
        {
            return System.IO.File.ReadAllText("./html/rfc2616.txt");
        }

        [HttpGet("file_read_rfc7523.txt")]
        public string GetFileReadRfc7523()
        {
            return System.IO.File.ReadAllText("./html/rfc7523.txt");
        }

    }
}