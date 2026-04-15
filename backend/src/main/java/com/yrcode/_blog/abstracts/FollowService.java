package com.yrcode._blog.abstracts;

import java.util.UUID;

public interface FollowService {
    Boolean toggleFollow(UUID targetUserId);
}
