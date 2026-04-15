package com.yrcode._blog.abstracts;

import java.util.List;
import java.util.UUID;

import com.yrcode._blog.dtos.comment.CommentDTO;
import com.yrcode._blog.dtos.comment.CommentRequestDTO;

public interface CommentService {
    List<CommentDTO> getPostComments(UUID postId);
    CommentDTO addComment(UUID postId, CommentRequestDTO requestDTO);
}
