package com.omar.jobtracker.service;

import com.omar.jobtracker.dto.AnalyticsSummaryResponse;
import com.omar.jobtracker.dto.AnalyticsTimelineResponse;
import com.omar.jobtracker.dto.ApplicationRequest;
import com.omar.jobtracker.dto.ApplicationResponse;
import com.omar.jobtracker.dto.ApplicationSummaryResponse;
import com.omar.jobtracker.dto.InterviewResponse;
import com.omar.jobtracker.dto.StatusHistoryResponse;
import com.omar.jobtracker.dto.StatusUpdateRequest;
import com.omar.jobtracker.exception.ResourceNotFoundException;
import com.omar.jobtracker.model.Application;
import com.omar.jobtracker.model.ApplicationStatus;
import com.omar.jobtracker.model.Interview;
import com.omar.jobtracker.model.StatusHistory;
import com.omar.jobtracker.repository.ApplicationRepository;
import com.omar.jobtracker.util.TextSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
/**
 * Core business logic for job applications.
 *
 * <p>This service is where the app's domain rules live:
 * every query is scoped to the authenticated user, status changes create
 * history entries, and analytics are derived from only that user's jobs.</p>
 */
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public ApplicationResponse createApplication(ApplicationRequest request) {
        // New applications are always attached to the currently logged-in user.
        Application application = Application.builder()
                .companyName(TextSanitizer.stripHtmlTags(request.getCompanyName()))
                .positionTitle(TextSanitizer.stripHtmlTags(request.getPositionTitle()))
                .jobUrl(request.getJobUrl())
                .dateApplied(request.getDateApplied())
                .currentStatus(request.getCurrentStatus())
                .salary(request.getSalary())
                .location(request.getLocation())
                .notes(request.getNotes())
                .user(currentUserService.getCurrentUserEntity())
                .build();

        Application savedApplication = applicationRepository.save(application);
        return toApplicationResponse(savedApplication);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationSummaryResponse> getApplications(ApplicationStatus status, Pageable pageable) {
        Long userId = currentUserService.getCurrentUserId();
        Page<Application> page = status == null
                ? applicationRepository.findByUserId(userId, pageable)
                : applicationRepository.findByUserIdAndCurrentStatus(userId, status, pageable);
        return page.map(this::toApplicationSummaryResponse);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id) {
        Application application = findApplicationOrThrow(id);
        initializeApplicationDetails(application);
        return toApplicationResponse(application);
    }

    @Transactional
    public ApplicationResponse updateApplication(Long id, ApplicationRequest request) {
        Application application = findApplicationOrThrow(id);

        ApplicationStatus previousStatus = application.getCurrentStatus();

        application.setCompanyName(TextSanitizer.stripHtmlTags(request.getCompanyName()));
        application.setPositionTitle(TextSanitizer.stripHtmlTags(request.getPositionTitle()));
        application.setJobUrl(request.getJobUrl());
        application.setDateApplied(request.getDateApplied());
        application.setCurrentStatus(request.getCurrentStatus());
        application.setSalary(request.getSalary());
        application.setLocation(request.getLocation());
        application.setNotes(request.getNotes());

        if (previousStatus != request.getCurrentStatus()) {
            // Full updates can still change status, so we keep history in sync
            // even outside the dedicated PATCH endpoint.
            application.addStatusHistory(buildStatusHistory(request.getCurrentStatus(), null));
        }

        Application savedApplication = applicationRepository.save(application);
        return toApplicationResponse(savedApplication);
    }

    @Transactional
    public void deleteApplication(Long id) {
        Application application = findApplicationOrThrow(id);
        applicationRepository.delete(application);
    }

    @Transactional
    public ApplicationResponse updateStatus(Long id, StatusUpdateRequest request) {
        Application application = findApplicationOrThrow(id);

        if (application.getCurrentStatus() != request.getStatus()) {
            // This is the dedicated "advance the application" flow used by the
            // detail page. It updates the current status and records when it changed.
            application.setCurrentStatus(request.getStatus());
            application.addStatusHistory(buildStatusHistory(request.getStatus(), request.getNotes()));
        }

        Application savedApplication = applicationRepository.save(application);
        return toApplicationResponse(savedApplication);
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getAnalyticsSummary() {
        List<Application> applications = applicationRepository.findByUserId(currentUserService.getCurrentUserId());

        Map<ApplicationStatus, Long> counts = new EnumMap<>(ApplicationStatus.class);
        Arrays.stream(ApplicationStatus.values()).forEach(status -> counts.put(status, 0L));
        applications.forEach(application -> counts.computeIfPresent(application.getCurrentStatus(), (status, count) -> count + 1));

        long totalApplications = applications.size();
        long movedPastApplied = applications.stream()
                .filter(application -> application.getCurrentStatus() != ApplicationStatus.APPLIED)
                .count();

        BigDecimal responseRate = totalApplications == 0
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(movedPastApplied)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalApplications), 2, RoundingMode.HALF_UP);

        return AnalyticsSummaryResponse.builder()
                .totalApplications(totalApplications)
                .applicationsByStatus(counts)
                .responseRate(responseRate)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsTimelineResponse getTimeline(String groupBy) {
        String normalizedGroupBy = normalizeGroupBy(groupBy);
        Map<String, Long> timeline = applicationRepository.findByUserId(currentUserService.getCurrentUserId())
                .stream()
                .collect(Collectors.groupingBy(
                        application -> formatPeriod(application.getDateApplied(), normalizedGroupBy),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        Map<String, Long> sortedTimeline = timeline.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        return AnalyticsTimelineResponse.builder()
                .groupBy(normalizedGroupBy)
                .applicationsByPeriod(sortedTimeline)
                .build();
    }

    private String normalizeGroupBy(String groupBy) {
        if (groupBy == null || groupBy.isBlank()) {
            return "week";
        }

        String normalized = groupBy.toLowerCase(Locale.ROOT);
        if (!normalized.equals("week") && !normalized.equals("month")) {
            throw new IllegalArgumentException("groupBy must be either 'week' or 'month'");
        }
        return normalized;
    }

    private String formatPeriod(LocalDate dateApplied, String groupBy) {
        if ("month".equals(groupBy)) {
            return String.format("%d-%02d", dateApplied.getYear(), dateApplied.getMonthValue());
        }

        WeekFields weekFields = WeekFields.ISO;
        int week = dateApplied.get(weekFields.weekOfWeekBasedYear());
        int year = dateApplied.get(weekFields.weekBasedYear());
        return String.format("%d-W%02d", year, week);
    }

    private StatusHistory buildStatusHistory(ApplicationStatus status, String notes) {
        return StatusHistory.builder()
                .status(status)
                .notes(notes)
                .build();
    }

    private Application findApplicationOrThrow(Long id) {
        // Ownership is enforced here so every caller gets the same protection.
        return applicationRepository.findByIdAndUserId(id, currentUserService.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id " + id));
    }

    private void initializeApplicationDetails(Application application) {
        // open-in-view is disabled, so child collections are initialized while
        // the transaction is still active.
        application.getStatusHistory().size();
        application.getInterviews().size();
    }

    private ApplicationSummaryResponse toApplicationSummaryResponse(Application application) {
        return ApplicationSummaryResponse.builder()
                .id(application.getId())
                .companyName(application.getCompanyName())
                .positionTitle(application.getPositionTitle())
                .jobUrl(application.getJobUrl())
                .dateApplied(application.getDateApplied())
                .currentStatus(application.getCurrentStatus())
                .salary(application.getSalary())
                .location(application.getLocation())
                .notes(application.getNotes())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }

    private ApplicationResponse toApplicationResponse(Application application) {
        List<StatusHistoryResponse> statusHistoryResponses = application.getStatusHistory()
                .stream()
                .map(this::toStatusHistoryResponse)
                .toList();

        List<InterviewResponse> interviewResponses = application.getInterviews()
                .stream()
                .map(this::toInterviewResponse)
                .toList();

        return ApplicationResponse.builder()
                .id(application.getId())
                .companyName(application.getCompanyName())
                .positionTitle(application.getPositionTitle())
                .jobUrl(application.getJobUrl())
                .dateApplied(application.getDateApplied())
                .currentStatus(application.getCurrentStatus())
                .salary(application.getSalary())
                .location(application.getLocation())
                .notes(application.getNotes())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .statusHistory(statusHistoryResponses)
                .interviews(interviewResponses)
                .build();
    }

    private StatusHistoryResponse toStatusHistoryResponse(StatusHistory statusHistory) {
        return StatusHistoryResponse.builder()
                .id(statusHistory.getId())
                .status(statusHistory.getStatus())
                .changedAt(statusHistory.getChangedAt())
                .notes(statusHistory.getNotes())
                .build();
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
