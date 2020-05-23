import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.JWT;
import java.util.Date;

@WebServlet
public class JwtServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        try {
            Algorithm algorithm = Algorithm.HMAC256("lua-resty-jwt");
            String token = JWT.create()
                    .withClaim("name", "customer1")
                    .withClaim("id", "a7c7de38-6755-49d8-91d8-b812630abd65")
                    .withClaim("tenant", "mytenant")
                    .withClaim("iat", new Date().getTime())
                    .sign(algorithm);

            resp.addHeader("Content-Type", "text/html");
            resp.setStatus(200);
            resp.getWriter().print(token);

        } catch (JWTCreationException exception){
            System.out.println(exception);

            resp.addHeader("Content-Type", "text/html");
            resp.setStatus(500);
            resp.getWriter().print("Error generating:" + exception.toString());

        }


    }

}
