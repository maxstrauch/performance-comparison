import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;

@WebServlet
public class GetRfc2616 extends HttpServlet {

    private File file;

    public GetRfc2616() {
        this.initFile();
    }

    private void initFile() {
        try {
            String path = System.getenv("STATIC_PATH");
            System.out.println("Path:" + path);

            this.file = new File(path + "/rfc2616.txt");

        } catch (Exception ex) {
            System.out.println(ex);
            throw new RuntimeException("Cannot get external file path!");
        }
    }

    public static void pipe(InputStream is, OutputStream os) throws IOException {
        int n;
        byte[] buffer = new byte[1024];
        while ((n = is.read(buffer)) > -1) {
            os.write(buffer, 0, n);
        }
        os.close();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.addHeader("Content-Type", "text/html");
        resp.setStatus(200);

        OutputStream output = resp.getOutputStream();

        GetRfc2616.pipe(new FileInputStream(this.file), output);

        output.flush();
    }

}
