package com.example.demo;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.JWT;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLDecoder;
import java.security.CodeSource;
import java.util.Date;

@RestController
public class HelloController {

    private File rfc2616;
    private File rfc7523;

    public HelloController() {
        this.init();
    }

    private void init() {
        try {
            String path = System.getenv("STATIC_PATH");
            System.out.println("Path:" + path);

            this.rfc2616 = new File(path + "/rfc2616.txt");
            this.rfc7523 = new File(path + "/rfc7523.txt");

        } catch (Exception ex) {
            System.out.println(ex);
            throw new RuntimeException("Cannot get external file path!");
        }
    }

    @RequestMapping("/json-generate")
    public String jsonGenerate() throws Exception {
        try {
            Algorithm algorithm = Algorithm.HMAC256("lua-resty-jwt");
            String token = JWT.create()
                    .withClaim("name", "customer1")
                    .withClaim("id", "a7c7de38-6755-49d8-91d8-b812630abd65")
                    .withClaim("tenant", "mytenant")
                    .withClaim("iat", new Date().getTime())
                    .sign(algorithm);
            return token;
        } catch (JWTCreationException exception){
            System.out.println(exception);
            throw new Exception("Cannot generate JWT!");
        }
    }

    @RequestMapping("/index.html")
    public String getIndexDoc() {
        return "<html><head><title></title></head><body><h1>It works!</h1></body></html>";
    }

    @RequestMapping("/info")
    public String getInfo() {
        return "test-springboot";
    }

    @RequestMapping("/file_read_rfc2616.txt")
    public void getFileReadRfc2616(HttpServletResponse resp) throws IOException {
        OutputStream output = resp.getOutputStream();
        HelloController.pipe(new FileInputStream(this.rfc2616), output);
        output.flush();
    }

    @RequestMapping("/file_read_rfc7523.txt")
    public void getFileReadRfc7523(HttpServletResponse resp) throws IOException {
        OutputStream output = resp.getOutputStream();
        HelloController.pipe(new FileInputStream(this.rfc7523), output);
        output.flush();
    }

    @RequestMapping("/rfc2616.txt")
    public void getRfc2616(HttpServletResponse resp) throws IOException {
        OutputStream output = resp.getOutputStream();
        HelloController.pipe(new FileInputStream(this.rfc2616), output);
        output.flush();
    }

    @RequestMapping("/rfc7523.txt")
    public void getRfc7523(HttpServletResponse resp) throws IOException {
        OutputStream output = resp.getOutputStream();
        HelloController.pipe(new FileInputStream(this.rfc7523), output);
        output.flush();
    }

    public static void pipe(InputStream is, OutputStream os) throws IOException {
        int n;
        byte[] buffer = new byte[1024];
        while ((n = is.read(buffer)) > -1) {
            os.write(buffer, 0, n);
        }
        os.close();
    }

}