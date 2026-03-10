package com.yrcode._blog.dtos.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record UserLoginDTO(
    @NotBlank(message="Email is required!")
    @Email(message="Invalid email format!")
    String email,
    
    @NotBlank(message="Password is required!")
    String password
) {}
