package com.assetmanagement.controller;

import com.assetmanagement.dto.request.LoginRequest;
import com.assetmanagement.dto.response.ApiResponse;
import com.assetmanagement.dto.response.JwtAuthResponse;
import com.assetmanagement.dto.response.UserResponse;
import com.assetmanagement.entity.User;
import com.assetmanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        User user = authService.getCurrentUserEntity();
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(user)));
    }
}
