package com.assetmanagement.controller;

import com.assetmanagement.dto.response.ApiResponse;
import com.assetmanagement.dto.response.DashboardSummaryResponse;
import com.assetmanagement.dto.response.NetMovementDetailResponse;
import com.assetmanagement.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        DashboardSummaryResponse summary = dashboardService.getSummary(baseId, equipmentTypeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/net-movement")
    public ResponseEntity<ApiResponse<NetMovementDetailResponse>> getNetMovementDetails(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        NetMovementDetailResponse details = dashboardService.getNetMovementDetails(baseId, equipmentTypeId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(details));
    }
}
