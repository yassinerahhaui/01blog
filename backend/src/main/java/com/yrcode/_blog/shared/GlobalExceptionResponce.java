package com.yrcode._blog.shared;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionResponce {
    /* had class bach nt7akem f les errors */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<GlobalResponse<?>> handleNoResponseException(NoResourceFoundException ex) {
        var errors = List.of(new GlobalResponse.ErrorItem("Resource not found!"));
        return new ResponseEntity<>(new GlobalResponse<>(errors),HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CustomResponseException.class)
    public ResponseEntity<GlobalResponse<?>> handleCustomException(CustomResponseException ex) {
        var errors = List.of(new GlobalResponse.ErrorItem(ex.getMessage()));
        return new ResponseEntity<>(new GlobalResponse<>(errors),HttpStatus.resolve(ex.getCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<GlobalResponse<?>> handleValidationException(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
            .map(err -> new GlobalResponse.ErrorItem(err.getField() + " " + err.getDefaultMessage()))
            .toList();
        return new ResponseEntity<>(new GlobalResponse<>(errors),HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalResponse<?>> handleGlobalException(Exception ex) {
        var errors = List.of(new GlobalResponse.ErrorItem("Internal Server Error: Something went wrong!")); 
        return new ResponseEntity<>(new GlobalResponse<>(errors), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<GlobalResponse<?>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        // Catch invalid Enum values (like sending "GIF" when only "IMAGE" or "VIDEO" exist)
        var errors = List.of(new GlobalResponse.ErrorItem("Invalid data format or missing required fields. Please check your inputs (e.g., correct MediaType)."));
        return new ResponseEntity<>(new GlobalResponse<>(errors), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({BadCredentialsException.class})
    public ResponseEntity<GlobalResponse<?>> handleBadCredentials(BadCredentialsException ex) {
        var errors = List.of(new GlobalResponse.ErrorItem(ex.getMessage())); 
        return new ResponseEntity<>(new GlobalResponse<>(errors), HttpStatus.UNAUTHORIZED);
    }
}
