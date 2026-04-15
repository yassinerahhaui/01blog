package com.yrcode._blog.repositories;

import com.yrcode._blog.entities.FollowEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface FollowRepo extends JpaRepository<FollowEntity, UUID> {
    
    @Query("SELECT f FROM FollowEntity f WHERE f.follower.id = :followerId AND f.following.id = :followingId")
    Optional<FollowEntity> findByFollowerIdAndFollowingId(@Param("followerId") UUID followerId, @Param("followingId") UUID followingId);

    @Query("SELECT COUNT(f) > 0 FROM FollowEntity f WHERE f.follower.id = :followerId AND f.following.id = :followingId")
    boolean existsByFollowerIdAndFollowingId(@Param("followerId") UUID followerId, @Param("followingId") UUID followingId);
}