package com.yrcode._blog.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.yrcode._blog.entities.UserEntity;

@Repository
public interface UserRepo extends JpaRepository<UserEntity, UUID> {

}
