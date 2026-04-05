package com.omar.jobtracker.repository;

import com.omar.jobtracker.model.Application;
import com.omar.jobtracker.model.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserId(Long userId);

    Page<Application> findByUserId(Long userId, Pageable pageable);

    List<Application> findByUserIdAndCurrentStatus(Long userId, ApplicationStatus currentStatus);

    Page<Application> findByUserIdAndCurrentStatus(Long userId, ApplicationStatus currentStatus, Pageable pageable);

    Optional<Application> findByIdAndUserId(Long id, Long userId);
}
