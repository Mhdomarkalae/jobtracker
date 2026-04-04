package com.omar.jobtracker.repository;

import com.omar.jobtracker.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByApplicationIdAndApplicationUserIdOrderByChangedAtDesc(Long applicationId, Long userId);
}
