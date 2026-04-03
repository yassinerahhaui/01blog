package com.yrcode._blog.dtos.post;

import org.hibernate.validator.constraints.URL;

import com.yrcode._blog.enums.MediaType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record PostCreateDTO(
    @NotBlank(message = "Post title cannot be empty.")
    @Size(min = 10, max = 200, message = "Title length must be between 10 and 200 characters.")
    String title,

    @NotBlank(message = "Post content cannot be empty.")
    @Size(max = 50000, message = "Post content is too long! (Max 50,000 characters)")
    String content,
    
    @URL(message = "The media URL must be a valid and properly formatted link.")
    @Size(max = 2083, message = "The media URL is too long.")
    String mediaUrl,
    
    @NotNull(message = "Media type must be specified.")
    MediaType mediaType
) {}
