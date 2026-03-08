package com.yrcode._blog.shared;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class CustomResponseException extends RuntimeException {
    
    private final int code;

    public CustomResponseException(int code, String message) {
        super(message);
        this.code = code;
    }

    // 1. Not Found (404)
    public static CustomResponseException ResourceNotFound(String message) {
        return new CustomResponseException(404, message);
    }

    // 2. Bad Request (400)
    public static CustomResponseException BadRequest(String message) {
        return new CustomResponseException(400, message);
    }
    
    // Unauthorized (401)
    public static CustomResponseException Unauthorized(String message) {
        return new CustomResponseException(401, message);
    }
}