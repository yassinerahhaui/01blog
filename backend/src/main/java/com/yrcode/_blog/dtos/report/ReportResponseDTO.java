package com.yrcode._blog.dtos.report;

import java.util.UUID;

import com.yrcode._blog.enums.ReportStatus;
import com.yrcode._blog.enums.ReportTargetType;

import lombok.Builder;

@Builder
public record ReportResponseDTO(
    UUID id,
    UUID targetId,
    ReportTargetType targetType,
    String reason,
    String details,
    ReportStatus status
) {}
