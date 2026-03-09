package com.yrcode._blog.abstracts;

import java.util.List;
import java.util.UUID;

import com.yrcode._blog.dtos.UserDetailsDTO;
import com.yrcode._blog.dtos.UserRegisterDTO;
import com.yrcode._blog.dtos.UserUpdateDTO;

public interface UserService {
    UserDetailsDTO findOne(UUID userId);
    List<UserDetailsDTO> findAll();
    UserDetailsDTO createOne(UserRegisterDTO user);
    void deleteOne(UUID userId);
    UserDetailsDTO updateOne(UserUpdateDTO user);
}
