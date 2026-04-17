package com.yrcode._blog.abstracts;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;

public interface PostService {
    PostDetailsDTO findOne(UUID id);
    List<PostDetailsDTO> findAll();
    PostDetailsDTO createOne(PostCreateDTO data, MultipartFile file);
    void deleteOne(UUID id);
    PostDetailsDTO updateOne(PostUpdateDTO data);
    PostDetailsDTO toggleHidePost(UUID id);
}
