package com.yrcode._blog.abstracts;

import java.util.List;
import java.util.UUID;

import com.yrcode._blog.dtos.admin.AdminReportDTO;
import com.yrcode._blog.dtos.report.ReportRequestDTO;
import com.yrcode._blog.dtos.report.ReportResponseDTO;
import com.yrcode._blog.enums.ReportTargetType;

public interface ReportService {
    List<AdminReportDTO> findAll();
    ReportResponseDTO createReport(UUID targetId, ReportTargetType targetType, ReportRequestDTO reportRequest);
    void dismissReport(UUID reportId);
}
