package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.InterviewType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewRequest {

    @NotNull(message = "interviewType is required")
    private InterviewType interviewType;

    @NotNull(message = "scheduledDate is required")
    private LocalDateTime scheduledDate;

    @Size(max = 120, message = "interviewerName must be 120 characters or fewer")
    private String interviewerName;

    @Size(max = 4000, message = "notes must be 4000 characters or fewer")
    private String notes;

    @Positive(message = "durationMinutes must be positive")
    private Integer durationMinutes;

    private Boolean completed;
}
