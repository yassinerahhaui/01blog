package com.yrcode._blog.dtos.post;

import com.yrcode._blog.enums.MediaType;

import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record PostCreateDTO(
    @Size(max=5000,message="Your content is too long. Please limit it to 5,000 characters or less.")
    String content,
    String mediaUrl,
    MediaType mediaType
) {}
