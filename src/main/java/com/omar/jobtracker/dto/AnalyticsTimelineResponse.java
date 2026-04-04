package com.omar.jobtracker.dto;

import lombok.Builder;
import lombok.Value;

import java.util.Map;

@Value
@Builder
public class AnalyticsTimelineResponse {
    String groupBy;
    Map<String, Long> applicationsByPeriod;
}
