package com.yrcode._blog.abstracts;

import java.util.List;
import java.util.UUID;

import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;

public interface PostService {
    PostDetailsDTO findOne(UUID id);
    List<PostDetailsDTO> findAll();
    PostDetailsDTO createOne(PostCreateDTO data);
    void deleteOne(UUID id);
    PostDetailsDTO updateOne(PostUpdateDTO data);
}
