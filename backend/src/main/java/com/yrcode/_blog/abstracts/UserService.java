package com.yrcode._blog.abstracts;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Slice;

import com.yrcode._blog.dtos.admin.UserAccessUpdateDTO;
import com.yrcode._blog.dtos.user.UserDetailsDTO;
import com.yrcode._blog.dtos.user.UserUpdateDTO;

public interface UserService {
    UserDetailsDTO findOne(UUID userId);
    List<UserDetailsDTO> findAll();
    Slice<UserDetailsDTO> searchUsers(String query, int page, int size);
    void deleteOne(UUID userId);
    UserDetailsDTO updateOne(UserUpdateDTO user);
    UserDetailsDTO updateAccess(UUID userId, UserAccessUpdateDTO userAccessUpdate);
}
