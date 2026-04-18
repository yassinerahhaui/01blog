package com.yrcode._blog.abstracts;

import java.util.List;
import java.util.UUID;

import com.yrcode._blog.dtos.notification.NotificationDTO;

public interface NotificationService {
    List<NotificationDTO> getUserNotifications(UUID userId);
    void markAsRead(UUID notificationId, UUID userId);
    void markAllAsRead(UUID userId);
    void notifyFollowers(UUID authorId, UUID postId, String postTitle);
    void notifyPostHiddenByAdmin(UUID postId);
    void notifyLike(UUID likerId, UUID postId);
    void notifyComment(UUID commenterId, UUID postId);
    void notifyFollow(UUID followerId, UUID followedId);
    void deleteNotification(UUID notificationId, UUID userId);
}
