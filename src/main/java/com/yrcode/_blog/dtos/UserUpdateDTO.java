package com.yrcode._blog.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UserUpdateDTO(
    @NotBlank(message = "Username is required!")
    @Size(min = 2, max = 60, message = "Username must be between 2 and 60 characters")
    String fullName,

    @NotBlank(message = "Username is required!")
    @Size(min = 2, max = 60, message = "Username must be between 2 and 60 characters")
    String username,

    @NotBlank(message = "Password is required!")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$", 
             message = "Password must contain uppercase, lowercase, number and special character")
    String password,
    
    @Size(min = 6, max = 255, message = "Username must be less than 255 characters")
    String avatarMedia
) {}
