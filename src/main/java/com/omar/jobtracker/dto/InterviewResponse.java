package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.InterviewType;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class InterviewResponse {
    Long id;
    Long applicationId;
    InterviewType interviewType;
    LocalDateTime scheduledDate;
    String interviewerName;
    String notes;
    Integer durationMinutes;
    Boolean completed;
}
