package com.yrcode._blog.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.yrcode._blog.dtos.user.AuthResponse;
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
    public ResponseEntity<GlobalResponse<AuthResponse>> register(@RequestBody @Valid UserRegisterDTO userData) {
        var res = AuthResponse.builder().token(authService.register(userData)).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(new GlobalResponse<>(res));
    }

    @PostMapping("/login")
    public ResponseEntity<GlobalResponse<AuthResponse>> login(@RequestBody @Valid UserLoginDTO userData) {
        var token = AuthResponse.builder().token(authService.login(userData)).build();
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(token));
    }
}
