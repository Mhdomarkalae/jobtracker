package com.omar.jobtracker.controller;

import com.omar.jobtracker.dto.AnalyticsSummaryResponse;
import com.omar.jobtracker.dto.AnalyticsTimelineResponse;
import com.omar.jobtracker.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ApplicationService applicationService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryResponse> getSummary() {
        return ResponseEntity.ok(applicationService.getAnalyticsSummary());
    }

    @GetMapping("/timeline")
    public ResponseEntity<AnalyticsTimelineResponse> getTimeline(
            @RequestParam(defaultValue = "week") String groupBy
    ) {
        return ResponseEntity.ok(applicationService.getTimeline(groupBy));
    }
}
