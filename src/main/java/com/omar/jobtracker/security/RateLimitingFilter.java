package com.omar.jobtracker.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omar.jobtracker.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;
    private final RateLimitService rateLimitService;

    public RateLimitingFilter(ObjectMapper objectMapper, RateLimitService rateLimitService) {
        this.objectMapper = objectMapper;
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        HttpServletRequest requestToUse = requiresBodyCaching(request) && !(request instanceof CachedBodyHttpServletRequest)
                ? new CachedBodyHttpServletRequest(request)
                : request;

        applyRateLimits(requestToUse);
        filterChain.doFilter(requestToUse, response);
    }

    private boolean requiresBodyCaching(HttpServletRequest request) {
        return HttpMethod.POST.matches(request.getMethod())
                && ("/api/auth/login".equals(request.getRequestURI()) || "/api/auth/signup".equals(request.getRequestURI()));
    }

    private void applyRateLimits(HttpServletRequest request) throws IOException {
        String path = request.getRequestURI();
        String clientIp = resolveClientIp(request);

        if (HttpMethod.POST.matches(request.getMethod()) && "/api/auth/login".equals(path)) {
            rateLimitService.enforce("login-ip:" + clientIp, 10, Duration.ofMinutes(1), "Too many login attempts from this IP.");
            String normalizedEmail = extractNormalizedEmail(request);
            if (normalizedEmail != null) {
                rateLimitService.enforce("login-email:" + normalizedEmail, 20, Duration.ofMinutes(15), "Too many login attempts for this account.");
            }
            return;
        }

        if (HttpMethod.POST.matches(request.getMethod()) && "/api/auth/signup".equals(path)) {
            rateLimitService.enforce("signup-ip:" + clientIp, 5, Duration.ofHours(1), "Too many signup attempts from this IP.");
            String normalizedEmail = extractNormalizedEmail(request);
            if (normalizedEmail != null) {
                rateLimitService.enforce("signup-email:" + normalizedEmail, 3, Duration.ofHours(6), "Too many signup attempts for this email.");
            }
            return;
        }

        if (!path.startsWith("/api") || "/api/health".equals(path) || HttpMethod.GET.matches(request.getMethod()) && "/api/auth/csrf".equals(path)) {
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user) {
            boolean readOnly = HttpMethod.GET.matches(request.getMethod());
            Duration window = Duration.ofMinutes(1);
            int ipLimit = readOnly ? 300 : 60;
            int userLimit = readOnly ? 300 : 60;
            String bucket = readOnly ? "read" : "write";
            rateLimitService.enforce("api-ip:" + bucket + ":" + clientIp, ipLimit, window, "API rate limit exceeded for this IP.");
            rateLimitService.enforce("api-user:" + bucket + ":" + user.id(), userLimit, window, "API rate limit exceeded for this account.");
        }
    }

    private String extractNormalizedEmail(HttpServletRequest request) throws IOException {
        if (!(request instanceof CachedBodyHttpServletRequest cachedRequest)) {
            return null;
        }

        String body = new String(cachedRequest.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        if (body.isBlank()) {
            return null;
        }

        JsonNode jsonNode = objectMapper.readTree(body);
        JsonNode emailNode = jsonNode.get("email");
        if (emailNode == null || emailNode.isNull()) {
            return null;
        }
        String email = emailNode.asText();
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
