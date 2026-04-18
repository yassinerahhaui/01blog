package com.yrcode._blog.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yrcode._blog.entities.PostEntity;

import java.util.UUID;


public interface PostRepo extends JpaRepository<PostEntity, UUID> {
    @Query("SELECT p FROM PostEntity p WHERE p.userId.id = :userId AND (p.isHidden = false OR p.userId.id = :currentUserId OR :isAdmin = true) ORDER BY COALESCE(p.lastUpdate, p.createdAt) DESC")
    Slice<PostEntity> findPostsByUserOrdered(@Param("userId") UUID userId, @Param("currentUserId") UUID currentUserId, @Param("isAdmin") boolean isAdmin, Pageable pageable);

    @Query("SELECT p FROM PostEntity p WHERE (p.userId.id IN (SELECT following.id FROM UserEntity u JOIN u.following following WHERE u.id = :currentUserId) OR p.userId.id = :currentUserId) AND p.isHidden = false ORDER BY COALESCE(p.lastUpdate, p.createdAt) DESC")
    Slice<PostEntity> findFeedPosts(@Param("currentUserId") UUID currentUserId, Pageable pageable);
}