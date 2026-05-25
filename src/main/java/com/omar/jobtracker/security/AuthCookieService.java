package com.omar.jobtracker.security;

import com.omar.jobtracker.config.AppSecurityProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class AuthCookieService {

    private final AppSecurityProperties securityProperties;
    private final JwtService jwtService;

    public AuthCookieService(AppSecurityProperties securityProperties, JwtService jwtService) {
        this.securityProperties = securityProperties;
        this.jwtService = jwtService;
    }

    public void writeSessionCookie(String token, HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildSessionCookie(token, jwtService.getExpirationSeconds()).toString());
    }

    public void clearSessionCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildSessionCookie("", 0).toString());
    }

    public String resolveToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (securityProperties.sessionCookieName().equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseCookie buildSessionCookie(String token, long maxAgeSeconds) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(securityProperties.sessionCookieName(), token)
                .httpOnly(true)
                .secure(securityProperties.cookieSecure())
                .sameSite(securityProperties.cookieSameSite())
                .path(securityProperties.sessionCookiePath())
                .maxAge(maxAgeSeconds);

        if (securityProperties.cookieDomain() != null && !securityProperties.cookieDomain().isBlank()) {
            builder.domain(securityProperties.cookieDomain());
        }

        return builder.build();
    }
}
