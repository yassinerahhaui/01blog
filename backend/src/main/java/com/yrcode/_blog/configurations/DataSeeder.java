package com.yrcode._blog.configurations;

import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.enums.Role;
import com.yrcode._blog.repositories.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initAdmin(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepo.existsByUsername("admin")) {
                
                UserEntity admin = UserEntity.builder()
                        .fullName("Super Admin")
                        .username("admin")
                        .email("Admin@01blog.com")
                        .password(passwordEncoder.encode("Admin@01blog.com")) 
                        .role(Role.ADMIN) 
                        .build();
                
                userRepo.save(admin);
                
                System.out.println("✅ Admin user created successfully: admin / admin123");
            }
        };
    }
}