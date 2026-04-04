package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.InterviewType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewRequest {

    @NotNull(message = "interviewType is required")
    private InterviewType interviewType;

    @NotNull(message = "scheduledDate is required")
    private LocalDateTime scheduledDate;

    private String interviewerName;

    private String notes;

    @Positive(message = "durationMinutes must be positive")
    private Integer durationMinutes;

    private Boolean completed;
}
