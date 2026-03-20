package com.yrcode._blog.dtos.post;

import org.hibernate.validator.constraints.URL;

import com.yrcode._blog.enums.MediaType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record PostCreateDTO(
    @NotBlank(message = "Post content cannot be empty.")
    @Pattern(
        regexp = "^[a-zA-Z0-9\\s_\\-]{10,500}$",
        message = "Content can only contain letters, numbers, spaces, underscores (_), and dashes (-). Length must be 10-500 characters."
    )
    String content,
    @URL(message = "The media URL must be a valid and properly formatted link.")
    @Size(max = 2083, message = "The media URL is too long.")
    String mediaUrl,
    @NotNull(message = "Media type must be specified.")
    MediaType mediaType
) {}
