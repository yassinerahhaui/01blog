package com.yrcode._blog.services;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yrcode._blog.abstracts.ReportService;
import com.yrcode._blog.dtos.admin.AdminReportDTO;
import com.yrcode._blog.dtos.report.ReportRequestDTO;
import com.yrcode._blog.dtos.report.ReportResponseDTO;
import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.entities.ReportEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.enums.ReportStatus;
import com.yrcode._blog.enums.ReportTargetType;
import com.yrcode._blog.repositories.PostRepo;
import com.yrcode._blog.repositories.ReportRepo;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.CustomResponseException;

@Service
public class ReportServiceImpl implements ReportService {
    @Autowired
    private ReportRepo reportRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private PostRepo postRepo;
    @Autowired
    private SecurityUtils securityUtils;

    @Override
    public List<AdminReportDTO> findAll() {
        List<ReportEntity> reports = reportRepo.findAllByOrderByCreatedAtDesc();
        return reports.stream()
                .map(report -> AdminReportDTO.builder()
                        .id(report.getId())
                        .reporterId(report.getReporterId())
                        .targetId(report.getTargetId())
                        .targetType(report.getTargetType())
                        .reason(report.getReason())
                        .details(report.getDetails())
                        .status(report.getStatus())
                        .createdAt(report.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public ReportResponseDTO createReport(UUID targetId, ReportTargetType targetType, ReportRequestDTO reportRequest) {
        UUID reporterId = securityUtils.getCurrentUserId();

        validateTargetExists(targetId, targetType, reporterId);

        reportRepo.findByReporterIdAndTargetIdAndTargetTypeAndStatus(
                        reporterId,
                        targetId,
                        targetType,
                        ReportStatus.OPEN)
                .ifPresent((existingReport) -> {
                    throw CustomResponseException.Conflict("You already submitted an open report for this item.");
                });

        ReportEntity report = ReportEntity.builder()
                .reporterId(reporterId)
                .targetId(targetId)
                .targetType(targetType)
                .reason(reportRequest.reason().trim())
                .details(reportRequest.details() == null ? null : reportRequest.details().trim())
                .status(ReportStatus.OPEN)
                .build();

        ReportEntity savedReport = reportRepo.save(report);

        return ReportResponseDTO.builder()
                .id(savedReport.getId())
                .targetId(savedReport.getTargetId())
                .targetType(savedReport.getTargetType())
                .reason(savedReport.getReason())
                .details(savedReport.getDetails())
                .status(savedReport.getStatus())
                .build();
    }

    private void validateTargetExists(UUID targetId, ReportTargetType targetType, UUID reporterId) {
        if (targetType == ReportTargetType.USER) {
            UserEntity targetUser = userRepo.findById(targetId)
                    .orElseThrow(() -> CustomResponseException.NotFound("Target user not found!"));
            if (targetUser.getId().equals(reporterId)) {
                throw CustomResponseException.BadRequest("You cannot report yourself.");
            }
            return;
        }

        PostEntity post = postRepo.findById(targetId)
                .orElseThrow(() -> CustomResponseException.NotFound("Target post not found!"));
        if (post.getUserId().equals(reporterId)) {
            throw CustomResponseException.BadRequest("You cannot report your own post.");
        }
    }

    @Override
    public void dismissReport(UUID reportId) {
        ReportEntity report = reportRepo.findById(reportId)
                .orElseThrow(() -> CustomResponseException.NotFound("Report not found!"));
        report.setStatus(ReportStatus.REVIEWED);
        reportRepo.save(report);
    }
}
