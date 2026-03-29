package com.yrcode._blog.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
