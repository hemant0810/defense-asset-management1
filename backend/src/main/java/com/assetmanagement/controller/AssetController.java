package com.assetmanagement.controller;

import com.assetmanagement.dto.response.ApiResponse;
import com.assetmanagement.entity.Asset;
import com.assetmanagement.entity.Role;
import com.assetmanagement.security.CustomUserDetails;
import com.assetmanagement.service.AssetService;
import com.assetmanagement.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;
    private final AuthService authService;

    public AssetController(AssetService assetService, AuthService authService) {
        this.assetService = assetService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Asset>>> getAssets(@RequestParam(required = false) Long baseId) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        Long effectiveBaseId = baseId;

        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getBaseId() != null) {
                effectiveBaseId = currentUser.getBaseId();
            }
        }

        List<Asset> assets = assetService.getAssetsByBase(effectiveBaseId);
        return ResponseEntity.ok(ApiResponse.success(assets));
    }

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<Integer>> getStock(
            @RequestParam Long baseId,
            @RequestParam Long equipmentTypeId) {
        int stock = assetService.getStock(baseId, equipmentTypeId);
        return ResponseEntity.ok(ApiResponse.success(stock));
    }
}
