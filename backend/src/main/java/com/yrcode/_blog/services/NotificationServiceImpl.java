package com.yrcode._blog.services;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yrcode._blog.abstracts.NotificationService;
import com.yrcode._blog.dtos.notification.NotificationDTO;
import com.yrcode._blog.entities.NotificationEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.NotificationRepo;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.shared.CustomResponseException;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private UserRepo userRepo;

    @Override
    public List<NotificationDTO> getUserNotifications(UUID userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(n -> NotificationDTO.builder()
                        .id(n.getId())
                        .message(n.getMessage())
                        .type(n.getType())
                        .referenceId(n.getReferenceId())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public void markAsRead(UUID notificationId, UUID userId) {
        NotificationEntity notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> CustomResponseException.NotFound("Notification not found!"));

        if (!notification.getUserId().equals(userId)) {
            throw CustomResponseException.BadRequest("This notification does not belong to you.");
        }

        notification.setIsRead(true);
        notificationRepo.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepo.markAllAsRead(userId);
    }

    @Override
    public void notifyFollowers(UUID authorId, UUID postId, String postTitle) {
        UserEntity author = userRepo.findById(authorId)
                .orElseThrow(() -> CustomResponseException.NotFound("Author not found!"));

        Set<UserEntity> followers = author.getFollowers();
        if (followers.isEmpty()) return;

        String truncatedTitle = postTitle.length() > 60
                ? postTitle.substring(0, 60) + "…"
                : postTitle;
        String message = "@" + author.getUsername() + " published: \"" + truncatedTitle + "\"";

        java.util.ArrayList<NotificationEntity> notifications = new java.util.ArrayList<>();
        for (UserEntity follower : followers) {
            notifications.add(NotificationEntity.builder()
                    .userId(follower.getId())
                    .message(message)
                    .type("NEW_POST")
                    .referenceId(postId)
                    .isRead(false)
                    .build());
        }

        notificationRepo.saveAll(notifications);
    }

    @Override
    public void deleteNotification(UUID notificationId, UUID userId) {
        NotificationEntity notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> CustomResponseException.NotFound("Notification not found!"));

        if (!notification.getUserId().equals(userId)) {
            throw CustomResponseException.BadRequest("This notification does not belong to you.");
        }

        notificationRepo.delete(notification);
    }
}
