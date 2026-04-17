package com.yrcode._blog.dtos.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReportRequestDTO(
    @NotBlank(message = "Reason is required!")
    @Size(max = 120, message = "Reason must be less than 120 characters")
    String reason,

    @Size(max = 1000, message = "Details must be less than 1000 characters")
    String details
) {}
