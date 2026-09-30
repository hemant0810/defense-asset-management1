package com.assetmanagement.controller;

import com.assetmanagement.dto.request.AssignmentRequest;
import com.assetmanagement.dto.response.ApiResponse;
import com.assetmanagement.entity.Assignment;
import com.assetmanagement.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Assignment>>> getAssignments(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "assignmentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Assignment> assignments = assignmentService.getAssignments(
                baseId, equipmentTypeId, startDate, endDate, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BASE_COMMANDER')")
    public ResponseEntity<ApiResponse<Assignment>> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        Assignment assignment = assignmentService.createAssignment(request);
        return new ResponseEntity<>(ApiResponse.success("Equipment assigned successfully", assignment), HttpStatus.CREATED);
    }
}
