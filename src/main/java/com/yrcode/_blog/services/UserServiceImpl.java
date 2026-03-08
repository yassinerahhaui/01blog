package com.yrcode._blog.services;

import java.util.List;
import java.util.UUID;
import static java.util.stream.Collectors.toList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.yrcode._blog.abstracts.UserService;
import com.yrcode._blog.dtos.UserDetailsDTO;
import com.yrcode._blog.dtos.UserRegisterDTO;
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
    public UserDetailsDTO createOne(UserRegisterDTO user) {
        if (!user.password().equals(user.passwordConfirmation())) {
            throw CustomResponseException.BadRequest("Passwords do not match!");
        }
        UserEntity userData = UserEntity.builder()
            .username(user.username())
            .email(user.email())
            .password(user.password())
            .build();

        UserEntity savedUser = userRepo.save(userData);

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

    @Override
    public void deleteOne(UUID userId) {
        UserEntity user = userRepo.findById(userId)
            .orElseThrow(()-> CustomResponseException.BadRequest("Invalid user id!"));
        userRepo.deleteById(user.getId());
    }

    @Override
    public UserDetailsDTO updateOne(UserEntity user){
        return null;
    }
    
}

