package com.omar.jobtracker.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class UserResponse {
    Long id;
    String email;
    LocalDateTime createdAt;
}
