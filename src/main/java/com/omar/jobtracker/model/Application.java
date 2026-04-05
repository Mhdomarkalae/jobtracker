package com.omar.jobtracker.model;

import com.omar.jobtracker.validation.NotFutureDate;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "applications")
@EntityListeners(AuditingEntityListener.class)
@ToString(exclude = {"user", "statusHistory", "interviews"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String companyName;

    @NotBlank
    @Column(nullable = false)
    private String positionTitle;

    private String jobUrl;

    @NotNull
    @NotFutureDate
    @Column(nullable = false)
    private LocalDate dateApplied;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus currentStatus;

    @Column(precision = 14, scale = 2)
    private BigDecimal salary;

    private String location;

    @Lob
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt DESC")
    private List<StatusHistory> statusHistory = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("scheduledDate ASC")
    private List<Interview> interviews = new ArrayList<>();

    public void addStatusHistory(StatusHistory historyEntry) {
        statusHistory.add(historyEntry);
        historyEntry.setApplication(this);
    }

    public void removeStatusHistory(StatusHistory historyEntry) {
        statusHistory.remove(historyEntry);
        historyEntry.setApplication(null);
    }

    public void addInterview(Interview interview) {
        interviews.add(interview);
        interview.setApplication(this);
    }

    public void removeInterview(Interview interview) {
        interviews.remove(interview);
        interview.setApplication(null);
    }
}
