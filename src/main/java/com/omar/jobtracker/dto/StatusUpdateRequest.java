package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "status is required")
    private ApplicationStatus status;

    @Size(max = 2000, message = "notes must be 2000 characters or fewer")
    private String notes;
}
