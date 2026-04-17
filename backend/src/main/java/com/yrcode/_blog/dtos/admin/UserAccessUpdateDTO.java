package com.yrcode._blog.dtos.admin;

import com.yrcode._blog.enums.Access;

import jakarta.validation.constraints.NotNull;

public record UserAccessUpdateDTO(
    @NotNull(message = "Access value is required!")
    Access access
) {}
