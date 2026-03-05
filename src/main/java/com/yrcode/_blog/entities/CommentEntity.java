package com.yrcode._blog.entities;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name="comments")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CommentEntity extends AbstractEntity {
    @Column(nullable=false,name="user_id")
    private UUID userId;

    @Column(nullable=false,name="post_id")
    private UUID postId;

    @Column(nullable=false)
    private String content;
}
