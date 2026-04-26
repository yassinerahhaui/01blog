package com.yrcode._blog.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yrcode._blog.abstracts.ProfileService;
import com.yrcode._blog.abstracts.ReportService;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.report.ReportRequestDTO;
import com.yrcode._blog.dtos.report.ReportResponseDTO;
import com.yrcode._blog.dtos.user.FollowerDTO;
import com.yrcode._blog.enums.ReportTargetType;
// import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.GlobalResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;
    @Autowired
    private ReportService reportService;
    // @Autowired
    // private SecurityUtils securityUtils;

    @GetMapping("/{targetUserId}/posts")
    public ResponseEntity<GlobalResponse<Slice<PostDetailsDTO>>> findCurrentUserPosts(
            @PathVariable UUID targetUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        // UUID userId = securityUtils.getCurrentUserId();
        Slice<PostDetailsDTO> posts = profileService.getProfilePosts(targetUserId, page, size);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(posts));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<GlobalResponse<List<FollowerDTO>>> getFollowers(@PathVariable UUID userId) {
        List<FollowerDTO> followers = profileService.getFollowers(userId);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(followers));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<GlobalResponse<List<FollowerDTO>>> getFollowing(@PathVariable UUID userId) {
        List<FollowerDTO> following = profileService.getFollowing(userId);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(following));
    }

    @PostMapping("/{targetUserId}/follow")
    public ResponseEntity<GlobalResponse<String>> toggleFollow(@PathVariable UUID targetUserId) {
        String message = profileService.toggleFollow(targetUserId);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(message));
    }

    @PostMapping("/{targetUserId}/report")
    public ResponseEntity<GlobalResponse<ReportResponseDTO>> reportUser(
            @PathVariable UUID targetUserId,
            @Valid @RequestBody ReportRequestDTO request) {
        ReportResponseDTO report = reportService.createReport(targetUserId, ReportTargetType.USER, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new GlobalResponse<>(report));
    }
}
