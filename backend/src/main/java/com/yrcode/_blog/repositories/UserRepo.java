package com.yrcode._blog.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.yrcode._blog.entities.UserEntity;


@Repository
public interface UserRepo extends JpaRepository<UserEntity, UUID> {
    boolean existsByEmailAndIdNot(String email, UUID id);
    boolean existsByUsernameAndIdNot(String username, UUID id);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<UserEntity> findOneByUsername(String username);
    Optional<UserEntity> findOneByEmail(String email);

    @Query(value = "SELECT COUNT(*) > 0 FROM user_followers WHERE follower_id = :currentUserId AND user_id = :targetUserId", nativeQuery = true)
    boolean isFollowedByMe(@Param("currentUserId") UUID currentUserId, @Param("targetUserId") UUID targetUserId);
}
