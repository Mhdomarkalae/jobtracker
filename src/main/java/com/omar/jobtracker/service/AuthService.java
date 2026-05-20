package com.omar.jobtracker.service;

import com.omar.jobtracker.dto.AuthRequest;
import com.omar.jobtracker.dto.AuthResponse;
import com.omar.jobtracker.dto.SignupRequest;
import com.omar.jobtracker.dto.UserResponse;
import com.omar.jobtracker.model.User;
import com.omar.jobtracker.repository.UserRepository;
import com.omar.jobtracker.security.AuthenticatedUser;
import com.omar.jobtracker.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
/**
 * Handles account creation and login.
 *
 * <p>The service is intentionally small: it normalizes emails, hashes
 * passwords, authenticates credentials through Spring Security, and then
 * returns the frontend everything it needs to start a session: a JWT plus
 * the basic user profile.</p>
 */
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final LoginAttemptService loginAttemptService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Normalize emails once so the rest of the system treats different
        // casing as the same account.
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (!userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            userRepository.save(User.builder()
                    .email(normalizedEmail)
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .build());
        }

        return AuthResponse.builder()
                .message("If the email is eligible, the account is ready for sign-in.")
                .build();
    }

    @Transactional(readOnly = true)
    public AuthenticatedSession login(AuthRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        loginAttemptService.ensureNotBlocked(normalizedEmail);
        try {
            // AuthenticationManager delegates to our configured provider,
            // which compares the submitted password to the stored hash.
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
        } catch (BadCredentialsException exception) {
            loginAttemptService.recordFailure(normalizedEmail);
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        loginAttemptService.clearFailures(normalizedEmail);

        return buildAuthenticatedSession(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        return toUserResponse(currentUserService.getCurrentUserEntity());
    }

    @Transactional
    public void logoutCurrentUser() {
        User user = currentUserService.getCurrentUserEntity();
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    private AuthenticatedSession buildAuthenticatedSession(User user) {
        // The token becomes the frontend's session credential for all
        // later API requests.
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getTokenVersion()
        );
        return new AuthenticatedSession(
                jwtService.generateToken(authenticatedUser),
                AuthResponse.builder()
                        .message("Authenticated")
                        .user(toUserResponse(user))
                        .build()
        );
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
