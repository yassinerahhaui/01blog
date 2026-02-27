package com.yrcode._blog.entities;

import com.yrcode._blog.enums.Access;
import com.yrcode._blog.enums.Role;

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
@Table(name="users")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity extends AbstractEntity {
    @Column(nullable=false, name="full_name")
    private String fullName;

    @Column(nullable=false, unique=true)
    private String username;

    @Column(nullable=false, unique=true)
    private String email;

    @Column(nullable=false)
    private String password;

    @Column(nullable=true,name="avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @lombok.Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @lombok.Builder.Default
    private Access access = Access.ENABLED;
}
