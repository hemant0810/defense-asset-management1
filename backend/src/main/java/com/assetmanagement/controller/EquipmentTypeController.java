package com.assetmanagement.controller;

import com.assetmanagement.dto.request.EquipmentTypeRequest;
import com.assetmanagement.dto.response.ApiResponse;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.service.EquipmentTypeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment-types")
public class EquipmentTypeController {

    private final EquipmentTypeService equipmentTypeService;

    public EquipmentTypeController(EquipmentTypeService equipmentTypeService) {
        this.equipmentTypeService = equipmentTypeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentType>>> getAllEquipmentTypes() {
        return ResponseEntity.ok(ApiResponse.success(equipmentTypeService.getAllEquipmentTypes()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentType>> getEquipmentTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(equipmentTypeService.getEquipmentTypeById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentType>> createEquipmentType(@Valid @RequestBody EquipmentTypeRequest request) {
        EquipmentType created = equipmentTypeService.createEquipmentType(request);
        return new ResponseEntity<>(ApiResponse.success("Equipment type created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentType>> updateEquipmentType(
            @PathVariable Long id, @Valid @RequestBody EquipmentTypeRequest request) {
        EquipmentType updated = equipmentTypeService.updateEquipmentType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Equipment type updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEquipmentType(@PathVariable Long id) {
        equipmentTypeService.deleteEquipmentType(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment type deleted successfully", null));
    }
}
