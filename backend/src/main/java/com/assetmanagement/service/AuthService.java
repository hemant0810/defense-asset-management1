package com.assetmanagement.service;

import com.assetmanagement.dto.request.LoginRequest;
import com.assetmanagement.dto.response.JwtAuthResponse;
import com.assetmanagement.entity.User;
import com.assetmanagement.exception.ResourceNotFoundException;
import com.assetmanagement.repository.UserRepository;
import com.assetmanagement.security.CustomUserDetails;
import com.assetmanagement.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserRepository userRepository,
                       AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        auditLogService.log("LOGIN", "USER", userDetails.getId(), 
                "User logged in successfully: " + userDetails.getUsername());

        return new JwtAuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFullName(),
                userDetails.getEmail(),
                userDetails.getRole().name(),
                userDetails.getBaseId(),
                userDetails.getBaseName()
        );
    }

    public CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails;
        }
        return null;
    }

    public User getCurrentUserEntity() {
        CustomUserDetails userDetails = getCurrentUserDetails();
        if (userDetails == null) {
            return null;
        }
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));
    }
}
