package com.yrcode._blog.services;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.yrcode._blog.abstracts.ProfileService;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.repositories.PostRepo;

public class ProfileServiceImpl implements ProfileService {
    @Autowired
    private PostRepo postRepo;

    @Override
    public Slice<PostDetailsDTO> getProfilePosts(UUID userId, int page) {
        
        int size = 20;
        Pageable pageable = PageRequest.of(page, size);
        Slice<PostEntity> posts = postRepo.findPostsByUserOrdered(userId, pageable);
        Slice<PostDetailsDTO> result = posts.map((post)-> 
            PostDetailsDTO.builder()
            .id(post.getId())
            .title(post.getTitle())
            .content(post.getContent())
            .mediaType(post.getMediaType())
            .mediaUrl(post.getMediaUrl())
            .userId(post.getUserId())
            .build()
        );

        return result;
    }

}
