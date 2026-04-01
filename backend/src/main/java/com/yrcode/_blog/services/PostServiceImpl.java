package com.yrcode._blog.services;

import static java.util.stream.Collectors.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yrcode._blog.abstracts.PostService;
import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;
import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.PostRepo;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.CustomResponseException;

@Service
public class PostServiceImpl implements PostService {
    @Autowired
    private PostRepo postRepo;
    @Autowired
    private SecurityUtils securityUtils;
    @Autowired
    private UserRepo userRepo;
    @Override
    public PostDetailsDTO findOne(UUID id) {
        PostEntity post = postRepo.findById(id)
            .orElseThrow(()-> CustomResponseException.BadRequest("invalid post id!"));
        return PostDetailsDTO.builder()
            .id(post.getId())
            .title(post.getTitle())
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
                .title(post.getTitle())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .userId(post.getUserId())
                .build()
            ).collect(toList());
    }

    @Override
    public PostDetailsDTO createOne(PostCreateDTO data) {
        UUID userId = securityUtils.getCurrentUserId();
        UserEntity currentUser = userRepo.findById(userId)
            .orElseThrow(()-> CustomResponseException.BadRequest("user not found!"));
        
        PostEntity post = PostEntity.builder()
            .title(data.title())
            .content(data.content())
            .mediaUrl(data.mediaUrl())
            .mediaType(data.mediaType())
            .userId(currentUser)
            .build();
        
        PostEntity savedPost = postRepo.save(post);

        return PostDetailsDTO.builder()
            .id(savedPost.getId())
            .title(savedPost.getTitle())
            .content(savedPost.getContent())
            .mediaUrl(savedPost.getMediaUrl())
            .mediaType(savedPost.getMediaType())
            .userId(savedPost.getUserId())
            .build();
    }

    @Override
    public PostDetailsDTO updateOne(PostUpdateDTO data) {
        return null;
    }

    @Override
    public void deleteOne(UUID id) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        Optional<PostEntity> post = postRepo.findById(id);
        if (post == null || post.get().getUserId() != currentUserId) {
            throw CustomResponseException.BadRequest("Invalid post id!");
        }
        postRepo.deleteById(id);
    }
}
