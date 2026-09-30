package com.assetmanagement.controller;

import com.assetmanagement.dto.request.TransferRequest;
import com.assetmanagement.dto.response.ApiResponse;
import com.assetmanagement.entity.Transfer;
import com.assetmanagement.service.TransferService;
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
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Transfer>>> getTransfers(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long fromBaseId,
            @RequestParam(required = false) Long toBaseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transferDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Transfer> transfers = transferService.getTransfers(
                baseId, fromBaseId, toBaseId, equipmentTypeId, startDate, endDate, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(transfers));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_OFFICER')")
    public ResponseEntity<ApiResponse<Transfer>> createTransfer(@Valid @RequestBody TransferRequest request) {
        Transfer transfer = transferService.createTransfer(request);
        return new ResponseEntity<>(ApiResponse.success("Transfer completed successfully", transfer), HttpStatus.CREATED);
    }
}
