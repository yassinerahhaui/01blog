package com.yrcode._blog.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yrcode._blog.abstracts.NotificationService;
import com.yrcode._blog.dtos.notification.NotificationDTO;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.GlobalResponse;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<GlobalResponse<List<NotificationDTO>>> getMyNotifications() {
        UUID userId = securityUtils.getCurrentUserId();
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(new GlobalResponse<>(notifications));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId) {
        UUID userId = securityUtils.getCurrentUserId();
        notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        UUID userId = securityUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID notificationId) {
        UUID userId = securityUtils.getCurrentUserId();
        notificationService.deleteNotification(notificationId, userId);
        return ResponseEntity.noContent().build();
    }
}
