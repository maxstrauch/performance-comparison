import com.ex.filter.MyFilter;
import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;
import org.apache.tomcat.util.descriptor.web.FilterDef;
import org.apache.tomcat.util.descriptor.web.FilterMap;

import java.io.File;

public class Test {

    public static void main(String[] args) throws Exception {

        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8080);

        Context ctx = tomcat.addContext("", new File(".").getAbsolutePath());

        Tomcat.addServlet(ctx, "GetRfc2616", new GetRfc2616());
        Tomcat.addServlet(ctx, "GetRfc7523", new GetRfc7523());
        Tomcat.addServlet(ctx, "GetIndex", new GetIndex());
        Tomcat.addServlet(ctx, "GetInfo", new GetInfo());
        Tomcat.addServlet(ctx, "JwtServlet", new JwtServlet());

        ctx.addServletMappingDecoded("/file_read_rfc2616.txt", "GetRfc2616");
        ctx.addServletMappingDecoded("/rfc2616.txt", "GetRfc2616");
        ctx.addServletMappingDecoded("/file_read_rfc7523.txt", "GetRfc7523");
        ctx.addServletMappingDecoded("/rfc7523.txt", "GetRfc7523");
        ctx.addServletMappingDecoded("/info", "GetInfo");
        ctx.addServletMappingDecoded("/index.html", "GetIndex");
        ctx.addServletMappingDecoded("/json-generate", "JwtServlet");

        Class filterClass = MyFilter.class;
        String filterName = filterClass.getName();
        FilterDef def = new FilterDef();
        def.setFilterName( filterName );
        def.setFilterClass(filterName);
        ctx.addFilterDef( def );

        FilterMap map = new FilterMap();
        map.setFilterName( filterName );
        map.addURLPattern( "/*" );
        ctx.addFilterMap( map );

        tomcat.start();
        tomcat.getServer().await();


    }

}
