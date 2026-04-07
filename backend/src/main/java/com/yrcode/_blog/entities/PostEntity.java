package com.yrcode._blog.entities;

import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.yrcode._blog.enums.MediaType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @Column(nullable=false)
    private String title;

    @Column(nullable=false,columnDefinition="TEXT")
    private String content;
    
    @Column(columnDefinition = "TEXT",nullable=true)
    private String mediaUrl;
    
    @Enumerated(EnumType.STRING)
    @lombok.Builder.Default
    private MediaType mediaType = MediaType.EMPTY;
    
    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="user_id",nullable=false)
    @OnDelete(action=OnDeleteAction.CASCADE)
    private UserEntity userId;

    public UUID getUserId() {
        return  userId.getId();
    }

    public String getUsername() {
        return userId.getUsername();
    }
}
