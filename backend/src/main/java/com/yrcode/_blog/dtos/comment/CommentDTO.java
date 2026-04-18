package com.yrcode._blog.dtos.comment;

import java.util.UUID;
import lombok.Builder;

@Builder
public record CommentDTO(
    UUID id,
    String content,
    String username,
    String mediaUrl,
    com.yrcode._blog.enums.MediaType mediaType
) {}