package com.omar.jobtracker.repository;

import com.omar.jobtracker.model.Application;
import com.omar.jobtracker.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserId(Long userId);

    List<Application> findByUserIdAndCurrentStatus(Long userId, ApplicationStatus currentStatus);

    Optional<Application> findByIdAndUserId(Long id, Long userId);
}
