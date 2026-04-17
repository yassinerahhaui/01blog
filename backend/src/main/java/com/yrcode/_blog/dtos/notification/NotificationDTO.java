package com.yrcode._blog.dtos.notification;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;

@Builder
public record NotificationDTO(
    UUID id,
    String message,
    String type,
    UUID referenceId,
    Boolean isRead,
    LocalDateTime createdAt
) {}
