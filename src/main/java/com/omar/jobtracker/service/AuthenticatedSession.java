package com.omar.jobtracker.service;

import com.omar.jobtracker.dto.AuthResponse;

public record AuthenticatedSession(String token, AuthResponse response) {
}
