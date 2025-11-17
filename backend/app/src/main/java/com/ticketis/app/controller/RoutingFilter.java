package com.ticketis.app.controller;


import org.springframework.stereotype.Component;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
@Component
public class RoutingFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI();
        
        if (isNonHtmlRequest(path)) {
            chain.doFilter(request, response);
            return;
        }
        
        if (!isStaticOrApi(path)) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }
        
        chain.doFilter(request, response);
    }
    
    private boolean isNonHtmlRequest(String path) {
        return path.contains(".") && 
               !path.endsWith(".html") && 
               !path.endsWith("/");
    }
    
    private boolean isStaticOrApi(String path) {
        return path.startsWith("/api/") ||
               path.startsWith("/ws/") ||
               path.startsWith("/static/") ||
               path.startsWith("/assets/") ||
               path.contains("/sockjs/") ||
               path.endsWith(".js") ||
               path.endsWith(".css") ||
               path.endsWith(".ico");
    }
}