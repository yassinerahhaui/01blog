package com.yrcode._blog.dtos.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UserRegisterDTO(

    @NotBlank(message = "Username is required!")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Pattern(
        regexp = "^[a-zA-Z0-9_-]+$", 
        message = "Username can only contain letters, numbers, dashes (-), and underscores (_)"
    )
    String username,

    @NotBlank(message = "Email is required!")
    @Email(message = "Invalid email format")
    @Pattern(
        regexp = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", 
        message = "Email must be valid (e.g. user@example.com)"
    )
    String email,

    @NotBlank(message = "Password is required!")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$", 
             message = "Password must contain uppercase, lowercase, number and special character")
    String password,

    @NotBlank(message = "Password confirmation is required!")
    String passwordConfirmation
) {}