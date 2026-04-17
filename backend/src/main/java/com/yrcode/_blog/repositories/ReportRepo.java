package com.yrcode._blog.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yrcode._blog.entities.ReportEntity;
import com.yrcode._blog.enums.ReportStatus;
import com.yrcode._blog.enums.ReportTargetType;

@Repository
public interface ReportRepo extends JpaRepository<ReportEntity, UUID> {
    List<ReportEntity> findAllByOrderByCreatedAtDesc();
    Optional<ReportEntity> findByReporterIdAndTargetIdAndTargetTypeAndStatus(
            UUID reporterId,
            UUID targetId,
            ReportTargetType targetType,
            ReportStatus status);
}
