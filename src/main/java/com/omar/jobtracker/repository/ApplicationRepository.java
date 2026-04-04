package com.omar.jobtracker.repository;

import com.omar.jobtracker.model.Application;
import com.omar.jobtracker.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByCurrentStatus(ApplicationStatus currentStatus);
}
