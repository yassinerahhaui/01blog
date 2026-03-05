package com.yrcode._blog.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.yrcode._blog.shared.CustomResponseException;


@RestController
@RequestMapping("/api/users")
public class UsersController {
    
    @GetMapping
    public String getUsers() {
        throw CustomResponseException.ResourceNotFound("No user found!");
        // return "Users List";
    }
    
}
