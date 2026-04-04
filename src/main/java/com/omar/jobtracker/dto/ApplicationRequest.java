package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import com.omar.jobtracker.validation.NotFutureDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ApplicationRequest {

    @NotBlank(message = "companyName is required")
    private String companyName;

    @NotBlank(message = "positionTitle is required")
    private String positionTitle;

    private String jobUrl;

    @NotNull(message = "dateApplied is required")
    @NotFutureDate
    private LocalDate dateApplied;

    @NotNull(message = "currentStatus is required")
    private ApplicationStatus currentStatus;

    private String salaryRange;

    private String location;

    private String notes;
}
