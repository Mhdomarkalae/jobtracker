package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Value
@Builder
public class ApplicationSummaryResponse {
    Long id;
    String companyName;
    String positionTitle;
    String jobUrl;
    LocalDate dateApplied;
    ApplicationStatus currentStatus;
    String salaryRange;
    String location;
    String notes;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
