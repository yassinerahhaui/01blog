package com.yrcode._blog.services;

import java.util.List;
import java.util.UUID;
import static java.util.stream.Collectors.toList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yrcode._blog.abstracts.UserService;
import com.yrcode._blog.dtos.admin.UserAccessUpdateDTO;
import com.yrcode._blog.dtos.user.UserDetailsDTO;
import com.yrcode._blog.dtos.user.UserUpdateDTO;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.enums.Role;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.CustomResponseException;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private SecurityUtils securityUtils;

    @Override
    public UserDetailsDTO findOne(UUID userId) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.NotFound("User not found!"));

        UUID currentUserId = securityUtils.getCurrentUserId();

        boolean isFollowedByMe = userRepo.isFollowedByMe(currentUserId, user.getId());

        // System.err.println("followers" + user.getFollowersCount() + "following: " + user.getFollowingCount());
        
        return UserDetailsDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .access(user.getAccess())
                .followersCount(user.getFollowersCount())
                .followingCount(user.getFollowingCount())
                .isFollowedByMe(isFollowedByMe)
                .build();
    }

    @Override
    public List<UserDetailsDTO> findAll() {
        List<UserEntity> users = userRepo.findAll();
        UUID currentUserId = securityUtils.getCurrentUserId();
        return users.stream()
                .map(user -> {
                    boolean isFollowedByMe = userRepo.isFollowedByMe(currentUserId, user.getId());
                    return UserDetailsDTO.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .avatarUrl(user.getAvatarUrl())
                        .role(user.getRole())
                        .access(user.getAccess())
                        .followersCount(user.getFollowersCount())
                        .followingCount(user.getFollowingCount())
                        .isFollowedByMe(isFollowedByMe)
                        .build();
                })
                .collect(toList());
    }

    @Override
    public void deleteOne(UUID userId) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.BadRequest("Invalid user id!"));
        userRepo.deleteById(user.getId());
    }

    @Override
    public UserDetailsDTO updateOne(UserUpdateDTO data) {
        /* get existing user */
        UserEntity user = userRepo.findById(data.id())
                .orElseThrow(() -> CustomResponseException.BadRequest("Invalid user id!"));

        /* check if email is already in use */
        if (userRepo.existsByEmailAndIdNot(data.email(), data.id())) {
            throw CustomResponseException.Conflict("This email is already taken!");
        }
        /* check if username is already in use */
        if (userRepo.existsByUsernameAndIdNot(data.username(), data.id())) {
            throw CustomResponseException.Conflict("This username is already taken!");
        }
        /* update user */
        user.setFullName(data.fullName());
        user.setUsername(data.username());
        user.setEmail(data.email());
        user.setAvatarUrl(data.avatarUrl());

        /* save user */
        UserEntity userSaved = userRepo.save(user);

        /* return user with new data */
        return UserDetailsDTO.builder()
                .id(userSaved.getId())
                .fullName(userSaved.getFullName())
                .username(userSaved.getUsername())
                .email(userSaved.getEmail())
                .role(userSaved.getRole())
                .access(userSaved.getAccess())
                .build();
    }

    @Override
    public UserDetailsDTO updateAccess(UUID userId, UserAccessUpdateDTO userAccessUpdate) {
        UserEntity user = userRepo.findById(userId)
                .orElseThrow(() -> CustomResponseException.BadRequest("Invalid user id!"));

        UUID currentUserId = securityUtils.getCurrentUserId();
        if (user.getId().equals(currentUserId) && userAccessUpdate.access() != user.getAccess()) {
            throw CustomResponseException.BadRequest("You cannot change your own access.");
        }

        if (user.getRole() == Role.ADMIN && userAccessUpdate.access() != user.getAccess()) {
            throw CustomResponseException.BadRequest("Admin users cannot be blocked.");
        }

        user.setAccess(userAccessUpdate.access());
        UserEntity savedUser = userRepo.save(user);

        return UserDetailsDTO.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .avatarUrl(savedUser.getAvatarUrl())
                .role(savedUser.getRole())
                .access(savedUser.getAccess())
                .followersCount(savedUser.getFollowersCount())
                .followingCount(savedUser.getFollowingCount())
                .build();
    }
}
