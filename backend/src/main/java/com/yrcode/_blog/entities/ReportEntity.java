package com.yrcode._blog.entities;

import java.util.UUID;

import com.yrcode._blog.enums.ReportStatus;
import com.yrcode._blog.enums.ReportTargetType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "reports")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ReportEntity extends AbstractEntity {
    @Column(nullable = false)
    private UUID reporterId;

    @Column(nullable = false)
    private UUID targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportTargetType targetType;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Enumerated(EnumType.STRING)
    @lombok.Builder.Default
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.OPEN;
}
