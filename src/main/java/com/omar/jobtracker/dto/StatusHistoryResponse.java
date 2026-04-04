package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class StatusHistoryResponse {
    Long id;
    ApplicationStatus status;
    LocalDateTime changedAt;
    String notes;
}
