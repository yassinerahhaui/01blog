package com.yrcode._blog.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.yrcode._blog.dtos.user.UserDetailsDTO;
import com.yrcode._blog.dtos.user.UserLoginDTO;
import com.yrcode._blog.dtos.user.UserRegisterDTO;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.shared.CustomResponseException;

@Service
public class AuthService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;

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

    public String login(UserLoginDTO user) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.username(), user.password())
        );
        return "Token...";
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity account = userRepo.findOneByUsername(username)
                .or(() -> userRepo.findOneByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with: " + username));

        return User.builder()
                .username(account.getUsername())
                .password(account.getPassword())
                .roles(account.getRole().toString())
                .build();
    }

}
