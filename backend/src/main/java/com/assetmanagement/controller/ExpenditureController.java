package com.assetmanagement.controller;

import com.assetmanagement.dto.request.ExpenditureRequest;
import com.assetmanagement.dto.response.ApiResponse;
import com.assetmanagement.entity.Expenditure;
import com.assetmanagement.service.ExpenditureService;
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
@RequestMapping("/api/expenditures")
public class ExpenditureController {

    private final ExpenditureService expenditureService;

    public ExpenditureController(ExpenditureService expenditureService) {
        this.expenditureService = expenditureService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Expenditure>>> getExpenditures(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expenditureDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Expenditure> expenditures = expenditureService.getExpenditures(
                baseId, equipmentTypeId, startDate, endDate, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(expenditures));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'BASE_COMMANDER')")
    public ResponseEntity<ApiResponse<Expenditure>> createExpenditure(@Valid @RequestBody ExpenditureRequest request) {
        Expenditure expenditure = expenditureService.createExpenditure(request);
        return new ResponseEntity<>(ApiResponse.success("Expenditure recorded successfully", expenditure), HttpStatus.CREATED);
    }
}
