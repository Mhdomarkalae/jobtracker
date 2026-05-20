package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import com.omar.jobtracker.validation.SafeHttpUrl;
import com.omar.jobtracker.validation.NotFutureDate;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ApplicationRequest {

    @NotBlank(message = "companyName is required")
    @Size(max = 200, message = "companyName must be 200 characters or fewer")
    private String companyName;

    @NotBlank(message = "positionTitle is required")
    @Size(max = 200, message = "positionTitle must be 200 characters or fewer")
    private String positionTitle;

    @SafeHttpUrl(message = "jobUrl must be a valid http:// or https:// URL")
    @Size(max = 2048, message = "jobUrl must be 2048 characters or fewer")
    private String jobUrl;

    @NotNull(message = "dateApplied is required")
    @NotFutureDate(message = "dateApplied cannot be in the future")
    private LocalDate dateApplied;

    @NotNull(message = "currentStatus is required")
    private ApplicationStatus currentStatus;

    /**
     * Stored as {@link BigDecimal}; {@link DecimalMin} is the correct Bean Validation equivalent of {@code @Min(0)}.
     */
    @NotNull(message = "salary is required")
    @DecimalMin(value = "0", inclusive = true, message = "salary must be zero or greater")
    @Digits(integer = 12, fraction = 2, message = "salary must have at most 12 integer digits and 2 fraction digits")
    private BigDecimal salary;

    @Size(max = 200, message = "location must be 200 characters or fewer")
    private String location;

    @Size(max = 5000, message = "notes must be 5000 characters or fewer")
    private String notes;
}
