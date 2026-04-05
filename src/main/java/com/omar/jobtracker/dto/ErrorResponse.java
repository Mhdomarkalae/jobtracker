package com.omar.jobtracker.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
@JsonPropertyOrder({"timestamp", "message", "status"})
public class ErrorResponse {
    LocalDateTime timestamp;
    String message;
    int status;
}
