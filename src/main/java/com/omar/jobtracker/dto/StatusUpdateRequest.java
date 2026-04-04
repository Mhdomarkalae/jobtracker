package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "status is required")
    private ApplicationStatus status;

    private String notes;
}
