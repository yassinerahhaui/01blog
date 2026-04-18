package com.yrcode._blog.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yrcode._blog.abstracts.ProfileService;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.user.FollowerDTO;
import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.PostRepo;
import com.yrcode._blog.repositories.ReactionRepo;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.CustomResponseException;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private PostRepo postRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private SecurityUtils securityUtils;
    @Autowired
    private ReactionRepo reactionRepo;

    @Override
    public Slice<PostDetailsDTO> getProfilePosts(UUID userId, int page) {
        int size = 20;
        Pageable pageable = PageRequest.of(page, size);
        UUID currentUserId = securityUtils.getCurrentUserId();
        UserEntity currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> CustomResponseException.BadRequest("User not found!"));
        boolean isAdmin = currentUser.getRole() == com.yrcode._blog.enums.Role.ADMIN;

        Slice<PostEntity> posts = postRepo.findPostsByUserOrdered(userId, currentUserId, isAdmin, pageable);
        Slice<PostDetailsDTO> result = posts.map((PostEntity post)-> {
                    boolean isLiked = reactionRepo.existsByPostIdAndUserId(post.getId(), currentUserId);
                    return PostDetailsDTO.builder()
                        .id(post.getId())
                        .title(post.getTitle())
                        .content(post.getContent())
                        .mediaType(post.getMediaType())
                        .mediaUrl(post.getMediaUrl())
                        .userId(post.getUserId())
                        .username(post.getUsername())
                        .commentsCount(post.getCommentsCount())
                        .likesCount(post.getLikesCount())
                        .isLikedByMe(isLiked)
                        .isHidden(post.getIsHidden())
                        .createdAt(post.getCreatedAt())
                        .build();
                    }
        );

        return result;
    }

    private FollowerDTO mapToFollowerDTO(UserEntity user) {
        return FollowerDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatarUrl())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowerDTO> getFollowers(UUID userId) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.NotFound("user not found!"));

        return user.getFollowers().stream()
                .map(this::mapToFollowerDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowerDTO> getFollowing(UUID userId) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.NotFound("user not found!"));

        return user.getFollowing().stream()
                .map(this::mapToFollowerDTO)
                .collect(Collectors.toList());
    }

    @Autowired
    private com.yrcode._blog.abstracts.NotificationService notificationService;

    @Override
    @Transactional
    public String toggleFollow(UUID targetUserId) {
        UUID currentUserId = securityUtils.getCurrentUserId();

        if (currentUserId.equals(targetUserId)) {
            throw CustomResponseException.BadRequest("You cannot follow yourself!");
        }

        UserEntity currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> CustomResponseException.NotFound("Current user not found"));

        UserEntity targetUser = userRepo.findById(targetUserId)
                .orElseThrow(() -> CustomResponseException.NotFound("Target user not found"));

        boolean isAlreadyFollowing = targetUser.getFollowers().contains(currentUser);

        if (isAlreadyFollowing) {
            targetUser.getFollowers().remove(currentUser);
            userRepo.save(targetUser);
            return "Unfollowed successfully";
        } else {
            targetUser.getFollowers().add(currentUser);
            userRepo.save(targetUser);
            
            // Notify the followed user
            try {
                notificationService.notifyFollow(currentUserId, targetUserId);
            } catch (Exception e) {
                // Ignore notification errors
            }
            
            return "Followed successfully";
        }
    }
}
