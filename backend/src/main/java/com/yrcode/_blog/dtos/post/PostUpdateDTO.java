package com.yrcode._blog.dtos.post;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PostUpdateDTO(
        @NotNull(message = "Post id is required") UUID id,

        @NotBlank(message = "Title is required") String title,

        @NotBlank(message = "Content is required") String content,

        Boolean removeMedia) {
}
