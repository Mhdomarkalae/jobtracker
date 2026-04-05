package com.omar.jobtracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
/**
 * Public health endpoint used by deployment platforms such as Render.
 *
 * <p>This stays outside authentication so infrastructure can check whether
 * the API is alive without needing a JWT.</p>
 */
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "application", "job-tracker",
                "timestamp", LocalDateTime.now()
        ));
    }
}
