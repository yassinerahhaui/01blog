package com.yrcode._blog.security;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.shared.CustomResponseException;


@Component
public class SecurityUtils {

    @Autowired
    private UserRepo userRepo;

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && !(authentication.getPrincipal() instanceof String)) {
            UserDetails currentUser = (UserDetails) authentication.getPrincipal();
            UserEntity user = userRepo.findOneByUsername(currentUser.getUsername())
                .orElseThrow(()-> CustomResponseException.BadRequest("invalid user!"));
            return user.getId();
        }

        throw CustomResponseException.Unauthorized("you don't have permission!");
    }

    public boolean isOwner(UUID id) {
        UUID currentUserId = getCurrentUserId();
        return id == currentUserId;
    }

}
