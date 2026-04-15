package com.yrcode._blog.repositories;

import com.yrcode._blog.entities.ReactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ReactionRepo extends JpaRepository<ReactionEntity, UUID> {

    @Query("SELECT r FROM ReactionEntity r WHERE r.post.id = :postId AND r.user.id = :userId")
    Optional<ReactionEntity> findByPostIdAndUserId(@Param("postId") UUID postId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(r) > 0 FROM ReactionEntity r WHERE r.post.id = :postId AND r.user.id = :userId")
    boolean existsByPostIdAndUserId(@Param("postId") UUID postId, @Param("userId") UUID userId);
}