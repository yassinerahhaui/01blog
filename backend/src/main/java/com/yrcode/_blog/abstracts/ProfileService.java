package com.yrcode._blog.abstracts;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Slice;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.user.FollowerDTO;

public interface ProfileService {
    Slice<PostDetailsDTO> getProfilePosts(UUID userId, int page);
    List<FollowerDTO> getFollowers(UUID userId);
    List<FollowerDTO> getFollowing(UUID userId);
    String toggleFollow(UUID targetUserId);
}
