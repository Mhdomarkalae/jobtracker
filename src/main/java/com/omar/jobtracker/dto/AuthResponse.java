package com.omar.jobtracker.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponse {
    String message;
    UserResponse user;
}
