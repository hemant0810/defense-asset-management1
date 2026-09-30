package com.assetmanagement.service;

import com.assetmanagement.dto.request.UserRequest;
import com.assetmanagement.dto.response.UserResponse;
import com.assetmanagement.entity.Base;
import com.assetmanagement.entity.Role;
import com.assetmanagement.entity.User;
import com.assetmanagement.exception.BadRequestException;
import com.assetmanagement.exception.ResourceNotFoundException;
import com.assetmanagement.repository.BaseRepository;
import com.assetmanagement.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BaseRepository baseRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository,
                       BaseRepository baseRepository,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.baseRepository = baseRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String search, Pageable pageable) {
        return userRepository.searchUsers(search, pageable).map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
        }
        if (!StringUtils.hasText(request.getPassword())) {
            throw new BadRequestException("Password is required for new users");
        }

        Base base = null;
        if (request.getBaseId() != null) {
            base = baseRepository.findById(request.getBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Base", "id", request.getBaseId()));
        } else if (request.getRole() != Role.ADMIN) {
            throw new BadRequestException("Assigned Base is required for Base Commanders and Logistics Officers");
        }

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getEmail(),
                request.getRole(),
                base
        );

        User saved = userRepository.save(user);

        auditLogService.log("USER_CREATED", "USER", saved.getId(),
                "Created user '" + saved.getUsername() + "' with role " + saved.getRole());

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (!user.getUsername().equalsIgnoreCase(request.getUsername()) &&
            userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) &&
            userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email '" + request.getEmail() + "' is already registered");
        }

        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getBaseId() != null) {
            Base base = baseRepository.findById(request.getBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Base", "id", request.getBaseId()));
            user.setBase(base);
        } else if (request.getRole() == Role.ADMIN) {
            user.setBase(null);
        } else {
            throw new BadRequestException("Assigned Base is required for role: " + request.getRole());
        }

        User updated = userRepository.save(user);

        auditLogService.log("USER_UPDATED", "USER", updated.getId(),
                "Updated user profile/role for '" + updated.getUsername() + "'");

        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        userRepository.delete(user);

        auditLogService.log("USER_DELETED", "USER", id, "Deleted user: " + user.getUsername());
    }
}
