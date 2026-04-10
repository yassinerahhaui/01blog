package com.yrcode._blog.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yrcode._blog.entities.PostEntity;

import java.util.UUID;


public interface PostRepo extends JpaRepository<PostEntity, UUID> {

    // مسحنا الميثودات القدام وخلينا غير هادي لي خدامة بـ @Query
    @Query("SELECT p FROM PostEntity p WHERE p.userId = :userId ORDER BY p.createdAt DESC, p.lastUpdate DESC")
    Slice<PostEntity> findPostsByUserOrdered(@Param("userId") UUID userId, Pageable pageable);
    
}