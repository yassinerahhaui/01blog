package com.yrcode._blog.abstracts;

import java.util.UUID;

public interface ReactionService {
    String toggleReaction(UUID postId);
}
