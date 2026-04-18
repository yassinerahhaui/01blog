package com.yrcode._blog.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yrcode._blog.abstracts.PostService;
import com.yrcode._blog.abstracts.ReportService;
import com.yrcode._blog.abstracts.UserService;
import com.yrcode._blog.dtos.admin.AdminReportDTO;
import com.yrcode._blog.dtos.admin.UserAccessUpdateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.user.UserDetailsDTO;
import com.yrcode._blog.shared.GlobalResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {
    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Autowired
    private ReportService reportService;

    @GetMapping("/users")
    public ResponseEntity<GlobalResponse<List<UserDetailsDTO>>> findAllUsers() {
        return ResponseEntity.ok(new GlobalResponse<>(userService.findAll()));
    }

    @PutMapping("/users/{userId}/access")
    public ResponseEntity<GlobalResponse<UserDetailsDTO>> updateUserAccess(
            @PathVariable UUID userId,
            @Valid @RequestBody UserAccessUpdateDTO userAccessUpdate) {
        UserDetailsDTO user = userService.updateAccess(userId, userAccessUpdate);
        return ResponseEntity.ok(new GlobalResponse<>(user));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        userService.deleteOne(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/posts")
    public ResponseEntity<GlobalResponse<List<PostDetailsDTO>>> findAllPosts() {
        return ResponseEntity.ok(new GlobalResponse<>(postService.findAllForAdmin()));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID postId) {
        postService.deleteOne(postId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("/posts/{postId}/hide")
    public ResponseEntity<GlobalResponse<PostDetailsDTO>> toggleHidePost(@PathVariable UUID postId) {
        PostDetailsDTO post = postService.toggleHidePost(postId);
        return ResponseEntity.ok(new GlobalResponse<>(post));
    }

    @GetMapping("/reports")
    public ResponseEntity<GlobalResponse<List<AdminReportDTO>>> findAllReports() {
        return ResponseEntity.ok(new GlobalResponse<>(reportService.findAll()));
    }

    @PutMapping("/reports/{reportId}/dismiss")
    public ResponseEntity<Void> dismissReport(@PathVariable UUID reportId) {
        reportService.dismissReport(reportId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
