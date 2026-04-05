package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class ApplicationResponse {
    Long id;
    String companyName;
    String positionTitle;
    String jobUrl;
    LocalDate dateApplied;
    ApplicationStatus currentStatus;
    BigDecimal salary;
    String location;
    String notes;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    List<StatusHistoryResponse> statusHistory;
    List<InterviewResponse> interviews;
}
