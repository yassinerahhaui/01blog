package com.yrcode._blog.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yrcode._blog.abstracts.ProfileService;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.GlobalResponse;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;
    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping("/posts")
    public ResponseEntity<GlobalResponse<Slice<PostDetailsDTO>>> findCurrentUserPosts(
            @RequestParam(defaultValue = "0") int page) {
        UUID userId = securityUtils.getCurrentUserId();
        Slice<PostDetailsDTO> posts = profileService.getProfilePosts(userId, page);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(posts));
    }

    // @GetMapping("/{userId}/followers")
    // public ResponseEntity<GlobalResponse<List<UserInfo>>> getFollowers(@PathVariable UUID userId) {
    //     // profileService.getFollowers(userId) خاصها تمشي للداتابيز وتجيب ليسته ديال UserInfo
    //     List<UserInfo> followers = profileService.getFollowers(userId);
    //     return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(followers));
    // }
    // @GetMapping("/{userId}/following")
    // public ResponseEntity<ApiResponse<List<UserInfo>>> getFollowing(@PathVariable UUID userId) {
    //     List<UserInfo> following = profileService.getFollowing(userId);
    //     return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(following));
    // }
}
