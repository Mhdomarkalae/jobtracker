package com.omar.jobtracker.service;

import com.omar.jobtracker.dto.InterviewRequest;
import com.omar.jobtracker.dto.InterviewResponse;
import com.omar.jobtracker.exception.ResourceNotFoundException;
import com.omar.jobtracker.model.Application;
import com.omar.jobtracker.model.Interview;
import com.omar.jobtracker.repository.ApplicationRepository;
import com.omar.jobtracker.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public InterviewResponse createInterview(Long applicationId, InterviewRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        Application application = applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + applicationId));

        Interview interview = Interview.builder()
                .application(application)
                .interviewType(request.getInterviewType())
                .scheduledDate(request.getScheduledDate())
                .interviewerName(request.getInterviewerName())
                .notes(request.getNotes())
                .durationMinutes(request.getDurationMinutes())
                .completed(Boolean.TRUE.equals(request.getCompleted()))
                .build();

        Interview savedInterview = interviewRepository.save(interview);
        return toInterviewResponse(savedInterview);
    }

    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByApplicationId(Long applicationId) {
        Long userId = currentUserService.getCurrentUserId();
        applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + applicationId));

        return interviewRepository.findByApplicationIdAndApplicationUserIdOrderByScheduledDateAsc(applicationId, userId)
                .stream()
                .map(this::toInterviewResponse)
                .toList();
    }

    @Transactional
    public InterviewResponse updateInterview(Long id, InterviewRequest request) {
        Interview interview = interviewRepository.findByIdAndApplicationUserId(id, currentUserService.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id " + id));

        interview.setInterviewType(request.getInterviewType());
        interview.setScheduledDate(request.getScheduledDate());
        interview.setInterviewerName(request.getInterviewerName());
        interview.setNotes(request.getNotes());
        interview.setDurationMinutes(request.getDurationMinutes());
        interview.setCompleted(Boolean.TRUE.equals(request.getCompleted()));

        Interview savedInterview = interviewRepository.save(interview);
        return toInterviewResponse(savedInterview);
    }

    @Transactional
    public void deleteInterview(Long id) {
        Interview interview = interviewRepository.findByIdAndApplicationUserId(id, currentUserService.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id " + id));
        interviewRepository.delete(interview);
    }

    private InterviewResponse toInterviewResponse(Interview interview) {
        return InterviewResponse.builder()
                .id(interview.getId())
                .applicationId(interview.getApplication().getId())
                .interviewType(interview.getInterviewType())
                .scheduledDate(interview.getScheduledDate())
                .interviewerName(interview.getInterviewerName())
                .notes(interview.getNotes())
                .durationMinutes(interview.getDurationMinutes())
                .completed(interview.getCompleted())
                .build();
    }
}
