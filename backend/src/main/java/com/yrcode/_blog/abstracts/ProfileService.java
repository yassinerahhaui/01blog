package com.yrcode._blog.abstracts;

import java.util.UUID;
import org.springframework.data.domain.Slice;
import com.yrcode._blog.dtos.post.PostDetailsDTO;

public interface ProfileService {
    Slice<PostDetailsDTO> getProfilePosts(UUID userId, int page);
    
}
