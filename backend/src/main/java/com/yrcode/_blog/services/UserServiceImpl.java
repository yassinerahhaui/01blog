package com.yrcode._blog.services;

import java.util.List;
import java.util.UUID;
import static java.util.stream.Collectors.toList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yrcode._blog.abstracts.UserService;
import com.yrcode._blog.dtos.user.UserDetailsDTO;
import com.yrcode._blog.dtos.user.UserUpdateDTO;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.shared.CustomResponseException;


@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetailsDTO findOne(UUID userId){
        UserEntity user = userRepo.findById(userId)
            .orElseThrow(()-> CustomResponseException.BadRequest("invalid user id!"));

        return UserDetailsDTO.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .username(user.getUsername())
            .email(user.getEmail())
            .avatarUrl(user.getAvatarUrl())
            .role(user.getRole())
            .access(user.getAccess())
            .build();
    }

    @Override
    public List<UserDetailsDTO> findAll() {
        List<UserEntity> users = userRepo.findAll();
        return users.stream()
            .map(user -> UserDetailsDTO.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .avatarUrl(user.getAvatarUrl())
                    .role(user.getRole())
                    .access(user.getAccess())
                    .build()
                ).collect(toList());
    }

    @Override
    public void deleteOne(UUID userId) {
        UserEntity user = userRepo.findById(userId)
            .orElseThrow(()-> CustomResponseException.BadRequest("Invalid user id!"));
        userRepo.deleteById(user.getId());
    }

    @Override
    public UserDetailsDTO updateOne(UserUpdateDTO data) {
        /* get existing user */
        UserEntity user = userRepo.findById(data.id())
            .orElseThrow(()-> CustomResponseException.BadRequest("Invalid user id!"));
        
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
    
}

