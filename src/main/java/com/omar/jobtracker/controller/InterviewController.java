package com.omar.jobtracker.controller;

import com.omar.jobtracker.dto.InterviewRequest;
import com.omar.jobtracker.dto.InterviewResponse;
import com.omar.jobtracker.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping({"/applications/{applicationId}/interviews", "/jobs/{applicationId}/interviews"})
    public ResponseEntity<InterviewResponse> createInterview(
            @PathVariable Long applicationId,
            @Valid @RequestBody InterviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(interviewService.createInterview(applicationId, request));
    }

    @GetMapping({"/applications/{applicationId}/interviews", "/jobs/{applicationId}/interviews"})
    public ResponseEntity<List<InterviewResponse>> getInterviews(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.getInterviewsByApplicationId(applicationId));
    }

    @PutMapping("/interviews/{id}")
    public ResponseEntity<InterviewResponse> updateInterview(
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request
    ) {
        return ResponseEntity.ok(interviewService.updateInterview(id, request));
    }

    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Long id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.noContent().build();
    }
}
