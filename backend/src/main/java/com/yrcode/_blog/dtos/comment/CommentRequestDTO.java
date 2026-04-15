package com.yrcode._blog.dtos.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequestDTO(
    @NotBlank(message = "Comment content cannot be empty")
    @Size(min = 1, max = 500, message = "Comment must be between 1 and 500 characters")
    String content
) {}