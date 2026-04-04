package com.omar.jobtracker.dto;

import com.omar.jobtracker.model.ApplicationStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.Map;

@Value
@Builder
public class AnalyticsSummaryResponse {
    long totalApplications;
    Map<ApplicationStatus, Long> applicationsByStatus;
    BigDecimal responseRate;
}
