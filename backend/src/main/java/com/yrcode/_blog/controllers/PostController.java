package com.yrcode._blog.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.yrcode._blog.abstracts.CommentService;
import com.yrcode._blog.abstracts.PostService;
import com.yrcode._blog.abstracts.ReactionService;
import com.yrcode._blog.abstracts.ReportService;
import com.yrcode._blog.dtos.comment.CommentDTO;
import com.yrcode._blog.dtos.comment.CommentRequestDTO;
import com.yrcode._blog.dtos.post.PostCreateDTO;
import com.yrcode._blog.dtos.post.PostDetailsDTO;
import com.yrcode._blog.dtos.post.PostUpdateDTO;
import com.yrcode._blog.dtos.report.ReportRequestDTO;
import com.yrcode._blog.dtos.report.ReportResponseDTO;
import com.yrcode._blog.enums.ReportTargetType;
import com.yrcode._blog.shared.GlobalResponse;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/api/post")
public class PostController {

    /* findAll - findOne - createOne - deleteOne - updateOne */
    @Autowired
    private PostService postService;
    @Autowired
    private CommentService commentService;
    @Autowired ReactionService reactionService;
    @Autowired ReportService reportService;

    @GetMapping("/all")
    public ResponseEntity<GlobalResponse<List<PostDetailsDTO>>> findAll() {
        List<PostDetailsDTO> posts = postService.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(posts));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<GlobalResponse<PostDetailsDTO>> findOne(@PathVariable UUID postId) {
        PostDetailsDTO post = postService.findOne(postId);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(post));
    }

    @PutMapping("/update")
    public ResponseEntity<GlobalResponse<PostDetailsDTO>> updateOne(@RequestBody @Valid PostUpdateDTO postData) {
        return null;
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<GlobalResponse<PostDetailsDTO>> createOne(
            @RequestPart("data") @Valid PostCreateDTO postData,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        PostDetailsDTO post = postService.createOne(postData, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(new GlobalResponse<>(post));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deleteOne(@PathVariable UUID postId) {
        postService.deleteOne(postId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<GlobalResponse<List<CommentDTO>>> getPostComments(@PathVariable UUID postId) {
        List<CommentDTO> comments = commentService.getPostComments(postId);
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(comments));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<GlobalResponse<CommentDTO>> addComment(
            @PathVariable UUID postId,
            @Valid @RequestBody CommentRequestDTO request) {

        CommentDTO newComment = commentService.addComment(postId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new GlobalResponse<>(newComment));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<GlobalResponse<Boolean>> toggleLike(@PathVariable UUID postId) {
        String likeRes = reactionService.toggleReaction(postId);
        Boolean result = false;
        if ("Liked".equals(likeRes)) {
            result = true;
        }
        return ResponseEntity.status(HttpStatus.OK).body(new GlobalResponse<>(result));
    }

    @PostMapping("/{postId}/report")
    public ResponseEntity<GlobalResponse<ReportResponseDTO>> reportPost(
            @PathVariable UUID postId,
            @Valid @RequestBody ReportRequestDTO request) {
        ReportResponseDTO report = reportService.createReport(postId, ReportTargetType.POST, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new GlobalResponse<>(report));
    }
}
