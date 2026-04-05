package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import com.omar.jobtracker.validation.NotFutureDate;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
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

    /**
     * Stored as {@link BigDecimal}; {@link DecimalMin} is the correct Bean Validation equivalent of {@code @Min(0)}.
     */
    @NotNull(message = "salary is required")
    @DecimalMin(value = "0", inclusive = true, message = "salary must be zero or greater")
    @Digits(integer = 12, fraction = 2, message = "salary must have at most 12 integer digits and 2 fraction digits")
    private BigDecimal salary;

    private String location;

    private String notes;
}
