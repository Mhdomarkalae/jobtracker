package com.omar.jobtracker.repository;

import com.omar.jobtracker.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationIdOrderByScheduledDateAsc(Long applicationId);
}
