package com.yrcode._blog.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.yrcode._blog.abstracts.UserService;
import com.yrcode._blog.dtos.user.UserDetailsDTO;
import com.yrcode._blog.dtos.user.UserRegisterDTO;
import com.yrcode._blog.dtos.user.UserUpdateDTO;
import com.yrcode._blog.shared.GlobalResponse;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/user")
public class UserController {
    /* getAll - getOne - createOne - deleteOne - updateOne */

    @Autowired
    private UserService userService;

    @GetMapping("/all")
    public ResponseEntity<GlobalResponse<List<UserDetailsDTO>>> findAll() {
        List<UserDetailsDTO> users = userService.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(users));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<GlobalResponse<UserDetailsDTO>> findOne(@PathVariable UUID userId) {
        UserDetailsDTO userDetails = userService.findOne(userId);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(userDetails));
    }

    @PostMapping("/create")
    public ResponseEntity<GlobalResponse<UserDetailsDTO>> createOne(@RequestBody @Valid UserRegisterDTO userData) {
        UserDetailsDTO user = userService.createOne(userData);
        return ResponseEntity.status(HttpStatus.CREATED).body(new GlobalResponse<>(user));
    }
    
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteOne(@PathVariable UUID userId) {
        userService.deleteOne(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/update")
    public ResponseEntity<GlobalResponse<UserDetailsDTO>> updateOne(@RequestBody @Valid UserUpdateDTO data) {
        UserDetailsDTO user = userService.updateOne(data);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(user));
    }
}


