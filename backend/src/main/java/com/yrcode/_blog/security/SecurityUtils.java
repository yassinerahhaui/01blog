package com.yrcode._blog.security;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.shared.CustomResponseException;


@Component
public class SecurityUtils {

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && !(authentication.getPrincipal() instanceof String)) {
            UserEntity currentUser = (UserEntity) authentication.getPrincipal();
            return currentUser.getId();
        }

        throw CustomResponseException.Unauthorized("you don't have permission!");
    }

}
