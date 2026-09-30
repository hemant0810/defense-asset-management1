package com.assetmanagement.controller;

import com.assetmanagement.dto.request.BaseRequest;
import com.assetmanagement.dto.response.ApiResponse;
import com.assetmanagement.entity.Base;
import com.assetmanagement.service.BaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bases")
public class BaseController {

    private final BaseService baseService;

    public BaseController(BaseService baseService) {
        this.baseService = baseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Base>>> getAllBases() {
        return ResponseEntity.ok(ApiResponse.success(baseService.getAllBases()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Base>> getBaseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(baseService.getBaseById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Base>> createBase(@Valid @RequestBody BaseRequest request) {
        Base created = baseService.createBase(request);
        return new ResponseEntity<>(ApiResponse.success("Base created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Base>> updateBase(@PathVariable Long id, @Valid @RequestBody BaseRequest request) {
        Base updated = baseService.updateBase(id, request);
        return ResponseEntity.ok(ApiResponse.success("Base updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBase(@PathVariable Long id) {
        baseService.deleteBase(id);
        return ResponseEntity.ok(ApiResponse.success("Base deleted successfully", null));
    }
}
