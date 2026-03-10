package com.yrcode._blog.dtos.post;

import java.util.UUID;

import com.yrcode._blog.enums.MediaType;

import lombok.Builder;


@Builder
public record PostDetailsDTO(
    UUID id,
    String content,
    String mediaUrl,
    MediaType mediaType,
    UUID userId
) {}
