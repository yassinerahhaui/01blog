package com.yrcode._blog.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;
import com.yrcode._blog.shared.GlobalResponse;

import jakarta.validation.Valid;


@Controller
@RequestMapping("/api/post")
public class PostController {
    /* findAll - findOne - createOne - deleteOne - updateOne */

    @GetMapping("/all")
    public ResponseEntity<GlobalResponse<List<PostDetailsDTO>>> findAll() {
        return null;
    }

    @GetMapping("/{postId}")
    public ResponseEntity<GlobalResponse<PostDetailsDTO>> findOne(@PathVariable UUID postId) {
        return null;
    }

    @PutMapping("/update")
    public ResponseEntity<GlobalResponse<PostDetailsDTO>> updateOne(@RequestBody @Valid PostUpdateDTO postData) {
        return null;
    }

    @PostMapping("/create")
    public ResponseEntity<GlobalResponse<PostDetailsDTO>> createOne(@RequestBody @Valid PostCreateDTO postData) {
        return null;
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deleteOne(@PathVariable UUID postId) {
        return null;
    }
}
