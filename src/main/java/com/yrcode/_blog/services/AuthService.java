package com.yrcode._blog.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yrcode._blog.dtos.user.UserDetailsDTO;
import com.yrcode._blog.dtos.user.UserRegisterDTO;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.shared.CustomResponseException;

public class AuthService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    public UserDetailsDTO register(UserRegisterDTO user) {
        /* check if password match password confirmation */
        if (!user.password().equals(user.passwordConfirmation())) {
            throw CustomResponseException.BadRequest("Passwords do not match!");
        }
        /* check if email is already taken with other user */
        if (userRepo.existsByEmail(user.email())) {
            throw CustomResponseException.Conflict("Email is already taken with other user!");
        }
        /* check if username is already taken with other user */
        if (userRepo.existsByUsername(user.username())) {
            throw CustomResponseException.Conflict("Username is already taken with other user!");
        }

        /* create new user */
        UserEntity userData = UserEntity.builder()
            .username(user.username())
            .email(user.email())
            .password(passwordEncoder.encode(user.password()))
            .build();

        /* save user in database */
        UserEntity savedUser = userRepo.save(userData);

        /* return user info to controller */
        return UserDetailsDTO.builder()
            .id(savedUser.getId())
            .fullName(savedUser.getFullName())
            .username(savedUser.getUsername())
            .email(savedUser.getEmail())
            .avatarUrl(savedUser.getAvatarUrl())
            .role(savedUser.getRole())
            .access(savedUser.getAccess())
            .build();
    }

}
