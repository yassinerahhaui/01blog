package com.yrcode._blog.dtos;

import java.util.UUID;

import com.yrcode._blog.enums.Access;
import com.yrcode._blog.enums.Role;

public record UserDetailsDTO(
    UUID id,
    String fullName,
    String username,
    String email,
    String avatarUrl,
    Role role,
    Access access
) {}
