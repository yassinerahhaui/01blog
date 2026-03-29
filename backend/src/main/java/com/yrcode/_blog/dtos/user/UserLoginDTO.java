package com.yrcode._blog.dtos.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UserLoginDTO(
    @NotBlank(message="Email or username is required!")
    @Size(min=3,max=255)
    String username,
    
    @NotBlank(message="Password is required!")
    @Size(min=3,max=255)
    String password
) {}
