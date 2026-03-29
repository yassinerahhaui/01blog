package com.yrcode._blog.dtos.user;

import lombok.Builder;

@Builder
public record AuthResponse(
    String token
) {}
