package com.yrcode._blog.dtos;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UserUpdateDTO(
    @NotNull(message = "User id is required!")
    UUID id,

    @NotBlank(message = "Username is required!")
    @Size(min = 2, max = 60, message = "Username must be between 2 and 60 characters")
    String fullName,

    @NotBlank(message = "Username is required!")
    @Size(min = 2, max = 60, message = "Username must be between 2 and 60 characters")
    String username,

    @NotBlank(message = "Email is required!")
    @Email(message = "Invalid email format")
    @Pattern(
        regexp = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", 
        message = "Email must be valid (e.g. user@example.com)"
    )
    String email,

    @Size(max = 255, message = "avatar url must be less than 255 characters")
    String avatarUrl
) {}
