package com.yrcode._blog.repositories;

import com.yrcode._blog.entities.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CommentRepo extends JpaRepository<CommentEntity, UUID> {
    // Find comments by post ID, ordered by the newest first
    List<CommentEntity> findByPost_IdOrderByCreatedAtDesc(UUID postId);
}