package com.yrcode._blog.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.yrcode._blog.dtos.user.UserDetailsDTO;
import com.yrcode._blog.dtos.user.UserLoginDTO;
import com.yrcode._blog.dtos.user.UserRegisterDTO;
import com.yrcode._blog.services.AuthService;
import com.yrcode._blog.shared.GlobalResponse;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<GlobalResponse<UserDetailsDTO>> register(@RequestBody @Valid UserRegisterDTO userData) {
        UserDetailsDTO user = authService.register(userData);
        return ResponseEntity.status(HttpStatus.CREATED).body(new GlobalResponse<>(user));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody @Valid UserLoginDTO userData) {
        String token = authService.login(userData);
        return ResponseEntity.status(HttpStatus.OK).body(token);
    }
}
