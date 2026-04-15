package com.yrcode._blog.services;

import com.yrcode._blog.dtos.comment.CommentDTO;
import com.yrcode._blog.dtos.comment.CommentRequestDTO;
import com.yrcode._blog.entities.CommentEntity;
import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.CommentRepo;
import com.yrcode._blog.repositories.PostRepo;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.CustomResponseException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.yrcode._blog.abstracts.CommentService;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepo commentRepo;
    private final PostRepo postRepo;
    private final UserRepo userRepo;
    private final SecurityUtils securityUtils;

    // Helper method to map Entity to DTO
    private CommentDTO mapToCommentDTO(CommentEntity entity) {
        return CommentDTO.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .username(entity.getUsername())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentDTO> getPostComments(UUID postId) {
        // Fetch comments and map them to DTOs
        return commentRepo.findByPost_IdOrderByCreatedAtDesc(postId)
                .stream()
                .map(this::mapToCommentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommentDTO addComment(UUID postId, CommentRequestDTO requestDTO) {
        // 1. Get current logged-in user
        UUID currentUserId = securityUtils.getCurrentUserId();
        UserEntity currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> CustomResponseException.NotFound("User not found"));

        // 2. Get the target post
        PostEntity targetPost = postRepo.findById(postId)
                .orElseThrow(() -> CustomResponseException.NotFound("Post not found"));

        // 3. Create and save the new comment
        CommentEntity newComment = CommentEntity.builder()
                .content(requestDTO.content())
                .post(targetPost)
                .user(currentUser)
                .build();

        CommentEntity savedComment = commentRepo.save(newComment);

        // 4. Return the saved comment as DTO to update the frontend instantly
        return mapToCommentDTO(savedComment);
    }
}