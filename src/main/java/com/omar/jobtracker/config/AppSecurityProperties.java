package com.omar.jobtracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record AppSecurityProperties(
        boolean cookieSecure,
        String cookieSameSite,
        String cookieDomain,
        String sessionCookieName,
        String sessionCookiePath,
        String csrfCookieName,
        String csrfHeaderName,
        boolean trustXForwardedFor
) {
}
