package com.omar.jobtracker.controller;

import com.omar.jobtracker.dto.AuthRequest;
import com.omar.jobtracker.dto.AuthResponse;
import com.omar.jobtracker.dto.SignupRequest;
import com.omar.jobtracker.dto.UserResponse;
import com.omar.jobtracker.security.AuthCookieService;
import com.omar.jobtracker.service.AuthService;
import com.omar.jobtracker.service.AuthenticatedSession;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthCookieService authCookieService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        AuthenticatedSession session = authService.login(request);
        authCookieService.writeSessionCookie(session.token(), response);
        return ResponseEntity.ok(session.response());
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletResponse response) {
        authService.logoutCurrentUser();
        authCookieService.clearSessionCookie(response);
        return ResponseEntity.ok(AuthResponse.builder().message("Logged out").build());
    }

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(CsrfToken csrfToken) {
        return ResponseEntity.ok(Map.of(
                "token", csrfToken.getToken(),
                "headerName", csrfToken.getHeaderName(),
                "parameterName", csrfToken.getParameterName()
        ));
    }
}
