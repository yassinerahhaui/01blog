package com.yrcode._blog.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yrcode._blog.entities.PostEntity;

public interface PostRepo extends JpaRepository<PostEntity, UUID> {}
