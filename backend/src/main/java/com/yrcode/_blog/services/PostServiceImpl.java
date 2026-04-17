package com.yrcode._blog.services;

import static java.util.stream.Collectors.*;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.yrcode._blog.abstracts.NotificationService;
import com.yrcode._blog.abstracts.PostService;
import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;
import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.enums.MediaType;
import com.yrcode._blog.enums.Role;
import com.yrcode._blog.repositories.PostRepo;
import com.yrcode._blog.repositories.ReactionRepo;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.CustomResponseException;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepo postRepo;
    @Autowired
    private SecurityUtils securityUtils;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private ReactionRepo reactionRepo;
    @Autowired
    private NotificationService notificationService;

    @Override
    public PostDetailsDTO findOne(UUID id) {
        PostEntity post = postRepo.findById(id)
                .orElseThrow(() -> CustomResponseException.BadRequest("invalid post id!"));
        UUID currentUserId = securityUtils.getCurrentUserId();
        boolean isLiked = reactionRepo.existsByPostIdAndUserId(post.getId(), currentUserId);
        return PostDetailsDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .userId(post.getUserId())
                .username(post.getUsername())
                .commentsCount(post.getCommentsCount())
                .likesCount(post.getLikesCount())
                .isLikedByMe(isLiked)
                .isHidden(post.getIsHidden())
                .createdAt(post.getCreatedAt())
                .build();
    }

    @Override
    public List<PostDetailsDTO> findAll() {
        List<PostEntity> posts = postRepo.findAll();
        UUID currentUserId = securityUtils.getCurrentUserId();
        UserEntity currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> CustomResponseException.BadRequest("User not found!"));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        return posts.stream()
                .filter(post -> isAdmin || !post.getIsHidden() || post.getUserId().equals(currentUserId))
                .map(post -> {
                    boolean isLiked = reactionRepo.existsByPostIdAndUserId(post.getId(), currentUserId);
                    return PostDetailsDTO.builder()
                    .id(post.getId())
                    .title(post.getTitle())
                    .content(post.getContent())
                    .mediaUrl(post.getMediaUrl())
                    .mediaType(post.getMediaType())
                    .userId(post.getUserId())
                    .username(post.getUsername())
                    .commentsCount(post.getCommentsCount())
                    .likesCount(post.getLikesCount())
                    .isLikedByMe(isLiked)
                    .isHidden(post.getIsHidden())
                    .createdAt(post.getCreatedAt())
                    .build();
                }
                ).collect(toList());
    }

    @Override
    public PostDetailsDTO createOne(PostCreateDTO data, MultipartFile file) {
        UUID userId = securityUtils.getCurrentUserId();
        UserEntity currentUser = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.BadRequest("user not found!"));

        String finalMediaUrl = null;
        MediaType finalMediaType = MediaType.EMPTY;

        // 1. Check if the user uploaded a file
        if (file != null && !file.isEmpty()) {
            // Upload the file to MinIO (Tika handles security checks here)
            finalMediaUrl = fileStorageService.uploadFile(file);
            // Convert the file's content type to our MediaType Enum
            finalMediaType = MediaType.fromString(file.getContentType());
        }

        PostEntity post = PostEntity.builder()
                .title(data.title())
                .content(data.content())
                .mediaUrl(finalMediaUrl)
                .mediaType(finalMediaType) // <-- The database will now store the clean Enum value
                .userId(currentUser)
                .build();

        try {
            PostEntity savedPost = postRepo.save(post);

            // Notify all followers about the new post
            try {
                notificationService.notifyFollowers(userId, savedPost.getId(), savedPost.getTitle());
            } catch (Exception ignored) {
                // Don't fail post creation if notifications fail
            }

            return PostDetailsDTO.builder()
                    .id(savedPost.getId())
                    .title(savedPost.getTitle())
                    .content(savedPost.getContent())
                    .mediaUrl(savedPost.getMediaUrl())
                    .mediaType(savedPost.getMediaType())
                    .userId(savedPost.getUserId())
                    .username(savedPost.getUsername())
                    .isHidden(savedPost.getIsHidden())
                    .createdAt(savedPost.getCreatedAt())
                    .build();

        } catch (Exception e) {
            if (file != null && !file.isEmpty() && finalMediaUrl != null) {
                fileStorageService.deleteFile(finalMediaUrl);
            }
            throw CustomResponseException.BadRequest("Failed to save post: The data might be invalid or too long.");
        }
    }

    @Override
    public PostDetailsDTO updateOne(PostUpdateDTO data) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        PostEntity post = postRepo.findById(data.id())
                .orElseThrow(() -> CustomResponseException.BadRequest("Invalid post id!"));

        if (!post.getUserId().equals(currentUserId)) {
            throw CustomResponseException.BadRequest("You can only edit your own posts.");
        }

        post.setTitle(data.title());
        post.setContent(data.content());
        PostEntity savedPost = postRepo.save(post);

        boolean isLiked = reactionRepo.existsByPostIdAndUserId(savedPost.getId(), currentUserId);

        return PostDetailsDTO.builder()
                .id(savedPost.getId())
                .title(savedPost.getTitle())
                .content(savedPost.getContent())
                .mediaUrl(savedPost.getMediaUrl())
                .mediaType(savedPost.getMediaType())
                .userId(savedPost.getUserId())
                .username(savedPost.getUsername())
                .commentsCount(savedPost.getCommentsCount())
                .likesCount(savedPost.getLikesCount())
                .isLikedByMe(isLiked)
                .isHidden(savedPost.getIsHidden())
                .createdAt(savedPost.getCreatedAt())
                .build();
    }

    @Override
    public void deleteOne(UUID id) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        PostEntity post = postRepo.findById(id)
                .orElseThrow(() -> CustomResponseException.BadRequest("Invalid post id!"));
        UserEntity currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> CustomResponseException.BadRequest("User not found!"));

        boolean isOwner = post.getUserId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw CustomResponseException.BadRequest("Invalid post id!");
        }
        String mediaUrl = post.getMediaUrl();
        if (mediaUrl != null) {
            fileStorageService.deleteFile(mediaUrl);
        }
        postRepo.deleteById(id);
    }

    @Override
    public PostDetailsDTO toggleHidePost(UUID id) {
        PostEntity post = postRepo.findById(id)
                .orElseThrow(() -> CustomResponseException.BadRequest("Invalid post id!"));
        
        post.setIsHidden(!post.getIsHidden());
        PostEntity savedPost = postRepo.save(post);

        UUID currentUserId = securityUtils.getCurrentUserId();
        boolean isLiked = reactionRepo.existsByPostIdAndUserId(savedPost.getId(), currentUserId);

        return PostDetailsDTO.builder()
                .id(savedPost.getId())
                .title(savedPost.getTitle())
                .content(savedPost.getContent())
                .mediaUrl(savedPost.getMediaUrl())
                .mediaType(savedPost.getMediaType())
                .userId(savedPost.getUserId())
                .username(savedPost.getUsername())
                .commentsCount(savedPost.getCommentsCount())
                .likesCount(savedPost.getLikesCount())
                .isLikedByMe(isLiked)
                .isHidden(savedPost.getIsHidden())
                .createdAt(savedPost.getCreatedAt())
                .build();
    }
}
