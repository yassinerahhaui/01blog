package com.yrcode._blog.services;

import java.util.List;
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

    @Autowired
    private com.yrcode._blog.repositories.PostRepo postRepo;

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

        java.util.Set<UserEntity> followers = author.getFollowers();
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
    public void notifyLike(UUID likerId, UUID postId) {
        com.yrcode._blog.entities.PostEntity post = postRepo.findById(postId).orElse(null);
        UserEntity liker = userRepo.findById(likerId).orElse(null);
        
        if (post == null || liker == null || post.getUserId().equals(likerId)) return;
        
        String message = "@" + liker.getUsername() + " liked your post.";
        
        NotificationEntity notification = NotificationEntity.builder()
                .userId(post.getUserId())
                .message(message)
                .type("LIKE")
                .referenceId(postId)
                .isRead(false)
                .build();
        notificationRepo.save(notification);
    }

    @Override
    public void notifyComment(UUID commenterId, UUID postId) {
        com.yrcode._blog.entities.PostEntity post = postRepo.findById(postId).orElse(null);
        UserEntity commenter = userRepo.findById(commenterId).orElse(null);
        
        if (post == null || commenter == null || post.getUserId().equals(commenterId)) return;
        
        String message = "@" + commenter.getUsername() + " commented on your post.";
        
        NotificationEntity notification = NotificationEntity.builder()
                .userId(post.getUserId())
                .message(message)
                .type("COMMENT")
                .referenceId(postId)
                .isRead(false)
                .build();
        notificationRepo.save(notification);
    }

    @Override
    public void notifyFollow(UUID followerId, UUID followedId) {
        UserEntity follower = userRepo.findById(followerId).orElse(null);
        UserEntity followed = userRepo.findById(followedId).orElse(null);
        
        if (follower == null || followed == null || followerId.equals(followedId)) return;
        
        String message = "@" + follower.getUsername() + " started following you.";
        
        NotificationEntity notification = NotificationEntity.builder()
                .userId(followedId)
                .message(message)
                .type("FOLLOW")
                .referenceId(followerId)
                .isRead(false)
                .build();
        notificationRepo.save(notification);
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
