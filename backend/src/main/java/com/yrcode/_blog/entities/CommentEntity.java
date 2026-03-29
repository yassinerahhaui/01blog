package com.yrcode._blog.entities;

import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name="comments")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CommentEntity extends AbstractEntity {
    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(nullable=false,name="user_id")
    @OnDelete(action=OnDeleteAction.CASCADE)
    private UserEntity userId;
    
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(nullable=false,name="post_id")
    @OnDelete(action=OnDeleteAction.CASCADE)
    private PostEntity postId;
    
    @Column(nullable=false)
    private String content;

    public UUID getUserId() {
        return userId.getId();
    }


    public UUID getPostId() {
        return postId.getId();
    }

}
