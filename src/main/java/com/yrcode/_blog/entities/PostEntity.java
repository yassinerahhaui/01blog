package com.yrcode._blog.entities;

import java.util.UUID;

import com.yrcode._blog.enums.MediaType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name="posts")
@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PostEntity extends AbstractEntity {
    @Column(name="user_id",nullable=false)
    private UUID userId;
    
    @Column(nullable=false)
    private String content;
    
    @Column(nullable=true)
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @lombok.Builder.Default
    private MediaType mediaType = MediaType.EMPTY;
}
