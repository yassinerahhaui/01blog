package com.yrcode._blog.services;

import com.yrcode._blog.abstracts.FollowService;
import com.yrcode._blog.entities.FollowEntity;
import com.yrcode._blog.entities.UserEntity;
import com.yrcode._blog.repositories.FollowRepo;
import com.yrcode._blog.repositories.UserRepo;
import com.yrcode._blog.security.SecurityUtils;
import com.yrcode._blog.shared.CustomResponseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

    private final FollowRepo followRepo;
    private final UserRepo userRepo;
    private final SecurityUtils securityUtils;

    @Transactional
    public Boolean toggleFollow(UUID targetUserId) {
        UUID currentUserId = securityUtils.getCurrentUserId();

        if (currentUserId.equals(targetUserId)) {
            throw CustomResponseException.BadRequest("You cannot follow yourself");
        }

        return followRepo.findByFollowerIdAndFollowingId(currentUserId, targetUserId)
                .map(follow -> {
                    followRepo.delete(follow);
                    return false; // unfollowed
                })
                .orElseGet(() -> {
                    UserEntity follower = userRepo.getReferenceById(currentUserId);
                    UserEntity following = userRepo.findById(targetUserId)
                            .orElseThrow(() -> CustomResponseException.NotFound("User to follow not found"));
                    
                    followRepo.save(FollowEntity.builder().follower(follower).following(following).build());
                    return true; // followed
                });
    }
}