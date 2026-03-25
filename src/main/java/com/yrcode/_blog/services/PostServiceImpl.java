package com.yrcode._blog.services;

import static java.util.stream.Collectors.*;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;

import com.yrcode._blog.abstracts.PostService;
import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;
import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.repositories.PostRepo;
import com.yrcode._blog.shared.CustomResponseException;

public class PostServiceImpl implements PostService {
    @Autowired
    private PostRepo postRepo;
    
    @Override
    public PostDetailsDTO findOne(UUID id) {
        PostEntity post = postRepo.findById(id)
            .orElseThrow(()-> CustomResponseException.BadRequest("invalid post id!"));
        return PostDetailsDTO.builder()
            .id(post.getId())
            .content(post.getContent())
            .mediaUrl(post.getMediaUrl())
            .mediaType(post.getMediaType())
            .userId(post.getUserId())
            .build();
    }

    @Override
    public List<PostDetailsDTO> findAll() {
        List<PostEntity> posts = postRepo.findAll();
        return posts.stream()
            .map(post -> PostDetailsDTO.builder()
                .id(post.getId())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .userId(post.getUserId())
                .build()
            ).collect(toList());
    }

    @Override
    public PostDetailsDTO createOne(PostCreateDTO data) {
        return null;
    }

    @Override
    public PostDetailsDTO updateOne(PostUpdateDTO data) {
        return null;
    }

    @Override
    public void deleteOne(UUID id) {}
}
