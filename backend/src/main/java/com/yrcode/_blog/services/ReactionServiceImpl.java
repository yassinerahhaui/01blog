package com.yrcode._blog.services;

import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.entities.ReactionEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.PostRepo;
import com.yrcode._blog.repositories.ReactionRepo;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.CustomResponseException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

import com.yrcode._blog.abstracts.ReactionService;

@Service
@RequiredArgsConstructor
public class ReactionServiceImpl implements ReactionService {

    private final ReactionRepo reactionRepo;
    private final PostRepo postRepo;
    private final UserRepo userRepo;
    private final SecurityUtils securityUtils;

    private final com.yrcode._blog.abstracts.NotificationService notificationService;

    @Override
    @Transactional
    public String toggleReaction(UUID postId) {
        UUID currentUserId = securityUtils.getCurrentUserId();

        Optional<ReactionEntity> existingReaction = reactionRepo.findByPostIdAndUserId(postId, currentUserId);

        if (existingReaction.isPresent()) {
            reactionRepo.delete(existingReaction.get());
            return "Unliked";
        } else {
            PostEntity targetPost = postRepo.findById(postId)
                    .orElseThrow(() -> CustomResponseException.NotFound("Post not found"));
            
            UserEntity currentUser = userRepo.getReferenceById(currentUserId);

            ReactionEntity newReaction = ReactionEntity.builder()
                    .post(targetPost)
                    .user(currentUser)
                    .build();

            reactionRepo.save(newReaction);
            
            // Notify the post owner
            try {
                notificationService.notifyLike(currentUserId, postId);
            } catch (Exception e) {
                // Ignore notification errors
            }
            
            return "Liked";
        }
    }
}