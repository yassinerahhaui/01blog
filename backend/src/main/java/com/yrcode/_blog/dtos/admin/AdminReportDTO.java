package com.yrcode._blog.dtos.admin;

import java.time.LocalDateTime;
import java.util.UUID;

import com.yrcode._blog.enums.ReportStatus;
import com.yrcode._blog.enums.ReportTargetType;

import lombok.Builder;

@Builder
public record AdminReportDTO(
    UUID id,
    UUID reporterId,
    UUID targetId,
    ReportTargetType targetType,
    String reason,
    String details,
    ReportStatus status,
    LocalDateTime createdAt
) {}
