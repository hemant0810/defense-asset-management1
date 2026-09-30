package com.assetmanagement;

import com.assetmanagement.dto.request.AssignmentRequest;
import com.assetmanagement.dto.request.ExpenditureRequest;
import com.assetmanagement.dto.request.PurchaseRequest;
import com.assetmanagement.dto.request.TransferRequest;
import com.assetmanagement.dto.response.DashboardSummaryResponse;
import com.assetmanagement.dto.response.NetMovementDetailResponse;
import com.assetmanagement.entity.Base;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.entity.Role;
import com.assetmanagement.repository.BaseRepository;
import com.assetmanagement.repository.EquipmentTypeRepository;
import com.assetmanagement.security.CustomUserDetails;
import com.assetmanagement.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class DashboardCalculationTests {

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private TransferService transferService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private ExpenditureService expenditureService;

    @Autowired
    private DashboardService dashboardService;

    private Base baseAlpha;
    private Base baseBravo;
    private EquipmentType equipment;

    @BeforeEach
    public void setup() {
        baseAlpha = baseRepository.save(new Base("Test Base Alpha", "Sector A"));
        baseBravo = baseRepository.save(new Base("Test Base Bravo", "Sector B"));
        equipment = equipmentTypeRepository.save(new EquipmentType("Test Recon Unit", "Vehicle", "Recon"));

        CustomUserDetails adminPrincipal = new CustomUserDetails(
                1L, "admin", "pass", "Admin User", "admin@test.com", Role.ADMIN, null, null,
                Collections.emptyList()
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(adminPrincipal, null, adminPrincipal.getAuthorities())
        );
    }

    @Test
    @DisplayName("Dashboard correctly calculates Net Movement and Closing Balance formulas")
    public void testDashboardCalculations() {
        LocalDate today = LocalDate.now();

        // 1. Purchase 50 units at Base Alpha
        purchaseService.createPurchase(new PurchaseRequest(
                baseAlpha.getId(), equipment.getId(), 50, today, "DASH-PO-01"));

        // 2. Transfer 10 units from Base Alpha to Base Bravo
        transferService.createTransfer(new TransferRequest(
                baseAlpha.getId(), baseBravo.getId(), equipment.getId(), 10, today, "DASH-TR-01"));

        // 3. Assign 5 units at Base Alpha
        assignmentService.createAssignment(new AssignmentRequest(
                baseAlpha.getId(), equipment.getId(), "Trooper X", 5, today));

        // 4. Expend 2 units at Base Alpha
        expenditureService.createExpenditure(new ExpenditureRequest(
                baseAlpha.getId(), equipment.getId(), 2, today, "Field attrition"));

        // Query summary for Base Alpha
        DashboardSummaryResponse summary = dashboardService.getSummary(
                baseAlpha.getId(), equipment.getId(), today.minusDays(1), today.plusDays(1));

        assertEquals(50, summary.getPurchases(), "Purchases must be 50");
        assertEquals(0, summary.getTransferIn(), "Transfer In for Alpha must be 0");
        assertEquals(10, summary.getTransferOut(), "Transfer Out for Alpha must be 10");

        // Net Movement = Purchases (50) + Transfer In (0) - Transfer Out (10) = 40
        assertEquals(40, summary.getNetMovement(), "Net Movement = Purchases + Transfer In - Transfer Out must equal 40");

        // Assigned = 5
        assertEquals(5, summary.getAssigned(), "Assigned must equal 5");

        // Expended = 2
        assertEquals(2, summary.getExpended(), "Expended must equal 2");

        // Closing Balance = Opening (0) + Net Movement (40) - Expended (2) = 38
        assertEquals(38, summary.getClosingBalance(), "Closing Balance must equal 38");

        // Available on hand = 50 - 10 - 5 - 2 = 33
        assertEquals(33, summary.getAvailableStock(), "Available Stock must equal 33");
    }

    @Test
    @DisplayName("Net Movement modal returns full breakdown of purchases and transfers")
    public void testNetMovementModalDetails() {
        LocalDate today = LocalDate.now();

        purchaseService.createPurchase(new PurchaseRequest(
                baseAlpha.getId(), equipment.getId(), 30, today, "MODAL-PO-01"));
        transferService.createTransfer(new TransferRequest(
                baseAlpha.getId(), baseBravo.getId(), equipment.getId(), 8, today, "MODAL-TR-01"));

        NetMovementDetailResponse details = dashboardService.getNetMovementDetails(
                baseAlpha.getId(), equipment.getId(), today.minusDays(1), today.plusDays(1));

        assertEquals(30, details.getTotalPurchases());
        assertEquals(8, details.getTotalTransferOut());
        assertEquals(22, details.getNetMovement()); // 30 - 8 = 22
        assertFalse(details.getPurchases().isEmpty());
        assertFalse(details.getTransfersOut().isEmpty());
    }
}
