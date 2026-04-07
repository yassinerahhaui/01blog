package com.yrcode._blog.services;

import static java.util.stream.Collectors.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.yrcode._blog.abstracts.PostService;
import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;
import com.yrcode._blog.entities.PostEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.enums.MediaType;
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
    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public PostDetailsDTO findOne(UUID id) {
        PostEntity post = postRepo.findById(id)
                .orElseThrow(() -> CustomResponseException.BadRequest("invalid post id!"));
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
    public PostDetailsDTO createOne(PostCreateDTO data, MultipartFile file) {
        UUID userId = securityUtils.getCurrentUserId();
        UserEntity currentUser = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.BadRequest("user not found!"));
        System.out.println(currentUser.getUsername());
        String finalMediaUrl = null;
        MediaType finalMediaType = MediaType.EMPTY;

        // 1. Check if the user uploaded a file
        if (file != null && !file.isEmpty()) {
            // Upload the file to MinIO (Tika handles security checks here)
            finalMediaUrl = fileStorageService.uploadFile(file);
            // Convert the file's content type to our MediaType Enum
            finalMediaType = MediaType.fromString(file.getContentType());
        }

        PostEntity post = PostEntity.builder()
                .title(data.title())
                .content(data.content())
                .mediaUrl(finalMediaUrl)
                .mediaType(finalMediaType) // <-- The database will now store the clean Enum value
                .userId(currentUser)
                .build();

        try {
            PostEntity savedPost = postRepo.save(post);
            return PostDetailsDTO.builder()
                    .id(savedPost.getId())
                    .title(savedPost.getTitle())
                    .content(savedPost.getContent())
                    .mediaUrl(savedPost.getMediaUrl())
                    .mediaType(savedPost.getMediaType())
                    .userId(savedPost.getUserId())
                    .build();

        } catch (Exception e) {
            if (file != null && !file.isEmpty() && finalMediaUrl != null) {
                fileStorageService.deleteFile(finalMediaUrl);
            }
            throw CustomResponseException.BadRequest("Failed to save post: The data might be invalid or too long.");
        }
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
        String mediaUrl = post.get().getMediaUrl();
        if (mediaUrl != null) {
            fileStorageService.deleteFile(mediaUrl);
        }
        postRepo.deleteById(id);
    }
}
