package com.yrcode._blog.services;

import java.util.List;
import java.util.UUID;

import com.yrcode._blog.abstracts.PostService;
import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;

public class PostServiceImpl implements PostService {
    public PostDetailsDTO findOne(UUID id) {
        return null;
    }

    public List<PostDetailsDTO> findAll() {
        return null;
    }

    public PostDetailsDTO createOne(PostCreateDTO data) {
        return null;
    }

    public PostDetailsDTO updateOne(PostUpdateDTO data) {
        return null;
    }

    public void deleteOne(UUID id) {
        
    }
}
