package com.yrcode._blog.entities;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.Formula;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.yrcode._blog.enums.Access;
import com.yrcode._blog.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity extends AbstractEntity implements UserDetails {

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = true, name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @lombok.Builder.Default
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @lombok.Builder.Default
    private Access access = Access.ENABLED;

    @ManyToMany
    @JoinTable(name = "user_followers", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "follower_id"))
    @lombok.Builder.Default
    private Set<UserEntity> followers = new HashSet<>();

    @ManyToMany(mappedBy = "followers")
    @lombok.Builder.Default
    private Set<UserEntity> following = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.role.name()));
    }

    @Formula("(SELECT COUNT(f.id) FROM follows f WHERE f.following_id = id)")
    private Integer followersCount;

    @Formula("(SELECT COUNT(f.id) FROM follows f WHERE f.follower_id = id)")
    private Integer followingCount;
}
