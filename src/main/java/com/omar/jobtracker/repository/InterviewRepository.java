package com.omar.jobtracker.repository;

import com.omar.jobtracker.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationIdAndApplicationUserIdOrderByScheduledDateAsc(Long applicationId, Long userId);

    Optional<Interview> findByIdAndApplicationUserId(Long id, Long userId);
}
