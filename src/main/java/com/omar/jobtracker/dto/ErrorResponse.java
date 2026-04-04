package com.omar.jobtracker.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ErrorResponse {
    String message;
    LocalDateTime timestamp;
    int status;
}
