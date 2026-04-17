package com.yrcode._blog.dtos.user;

import java.util.UUID;

import com.yrcode._blog.enums.Access;
import com.yrcode._blog.enums.Role;

import lombok.Builder;

/* this DTO for response only */
@Builder
public record UserDetailsDTO(
    UUID id,
    String fullName,
    String username,
    String email,
    String avatarUrl,
    Role role,
    Access access,
    Integer followersCount,
    Integer followingCount,
    Boolean isFollowedByMe
) {}
