package com.yrcode._blog.repositories;

import com.yrcode._blog.entities.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CommentRepo extends JpaRepository<CommentEntity, UUID> {
    // Find comments by post ID, ordered by the newest first
    List<CommentEntity> findByPost_IdOrderByCreatedAtDesc(UUID postId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM CommentEntity c WHERE c.post.id = :postId")
    void deleteByPostId(@org.springframework.data.repository.query.Param("postId") UUID postId);
}