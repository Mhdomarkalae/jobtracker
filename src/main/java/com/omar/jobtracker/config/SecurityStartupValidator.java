package com.omar.jobtracker.config;

import io.jsonwebtoken.io.Decoders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;

@Component
public class SecurityStartupValidator implements ApplicationRunner {

    private static final Set<String> DISALLOWED_DB_USERS = Set.of("postgres", "root", "admin", "administrator", "sa");

    private final Environment environment;
    private final String databaseUrl;
    private final String databaseUsername;
    private final String databasePassword;
    private final String jwtSecret;
    private final String allowedOriginPatterns;

    public SecurityStartupValidator(
            Environment environment,
            @Value("${spring.datasource.url}") String databaseUrl,
            @Value("${spring.datasource.username}") String databaseUsername,
            @Value("${spring.datasource.password}") String databasePassword,
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.cors.allowed-origin-patterns}") String allowedOriginPatterns
    ) {
        this.environment = environment;
        this.databaseUrl = databaseUrl;
        this.databaseUsername = databaseUsername;
        this.databasePassword = databasePassword;
        this.jwtSecret = jwtSecret;
        this.allowedOriginPatterns = allowedOriginPatterns;
    }

    @Override
    public void run(ApplicationArguments args) {
        requireNonBlank(databaseUrl, "DATABASE_URL must be configured");
        requireNonBlank(databaseUsername, "DATABASE_USERNAME must be configured");
        requireNonBlank(databasePassword, "DATABASE_PASSWORD must be configured");
        requireNonBlank(jwtSecret, "JWT_SECRET must be configured");
        requireStrongJwtSecret(jwtSecret);
        rejectPrivilegedDatabaseUsers(databaseUsername);
        rejectWildcardCorsOrigins(allowedOriginPatterns);
    }

    private void requireNonBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(message);
        }
    }

    private void requireStrongJwtSecret(String secret) {
        try {
            byte[] decodedSecret = Decoders.BASE64.decode(secret);
            if (decodedSecret.length < 32) {
                throw new IllegalStateException("JWT_SECRET must be base64 encoded and at least 32 bytes after decoding");
            }
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("JWT_SECRET must be a valid base64-encoded secret", exception);
        }
    }

    private void rejectPrivilegedDatabaseUsers(String username) {
        String normalized = username.trim().toLowerCase(Locale.ROOT);
        if (DISALLOWED_DB_USERS.contains(normalized)) {
            throw new IllegalStateException("Refusing to start with a privileged database user. Configure a least-privilege application role.");
        }
    }

    private void rejectWildcardCorsOrigins(String patterns) {
        boolean wildcardConfigured = Arrays.stream(patterns.split(","))
                .map(String::trim)
                .anyMatch(pattern -> pattern.equals("*") || pattern.equals("http://*") || pattern.equals("https://*"));
        if (wildcardConfigured) {
            throw new IllegalStateException("Wildcard CORS origins are not allowed for authenticated cookie-based sessions.");
        }
    }
}
