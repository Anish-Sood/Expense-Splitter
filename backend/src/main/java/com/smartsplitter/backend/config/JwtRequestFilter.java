package com.smartsplitter.backend.config;

import com.smartsplitter.backend.service.CustomUserDetailsService;
import com.smartsplitter.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @Autowired
    public JwtRequestFilter(CustomUserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // ADDED: Let's see every request that comes through this filter
        System.out.println(">>> JwtRequestFilter running for URI: " + request.getRequestURI());

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try { 
                username = jwtUtil.getUsernameFromToken(jwt);
                System.out.println(">>> Successfully extracted username: " + username);
            } catch (Exception e) {
                System.out.println(">>> ERROR parsing JWT: " + e.getMessage());
            }
        } else {
            System.out.println(">>> No 'Bearer ' token found in Authorization header.");
        }


        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println(">>> Security context is null, proceeding to load user details.");
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            System.out.println(">>> UserDetails loaded. Authorities: " + userDetails.getAuthorities());

            if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                System.out.println(">>> JWT is valid. Setting authentication in security context.");
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            } else {
                System.out.println(">>> JWT validation failed.");
            }
        }

        chain.doFilter(request, response);
    }
}