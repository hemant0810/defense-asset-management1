package com.assetmanagement;

import com.assetmanagement.dto.request.AssignmentRequest;
import com.assetmanagement.dto.request.ExpenditureRequest;
import com.assetmanagement.dto.request.PurchaseRequest;
import com.assetmanagement.dto.request.TransferRequest;
import com.assetmanagement.entity.*;
import com.assetmanagement.exception.BadRequestException;
import com.assetmanagement.exception.InsufficientInventoryException;
import com.assetmanagement.repository.BaseRepository;
import com.assetmanagement.repository.EquipmentTypeRepository;
import com.assetmanagement.security.CustomUserDetails;
import com.assetmanagement.service.AssetService;
import com.assetmanagement.service.AssignmentService;
import com.assetmanagement.service.ExpenditureService;
import com.assetmanagement.service.PurchaseService;
import com.assetmanagement.service.TransferService;
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
public class InventoryTransactionTests {

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    private AssetService assetService;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private TransferService transferService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private ExpenditureService expenditureService;

    private Base testBaseA;
    private Base testBaseB;
    private EquipmentType testEquipment;

    @BeforeEach
    public void setup() {
        testBaseA = baseRepository.save(new Base("Test Outpost Zulu", "Sector 7"));
        testBaseB = baseRepository.save(new Base("Test Outpost Yankee", "Sector 8"));
        testEquipment = equipmentTypeRepository.save(new EquipmentType(
                "Tactical Night Optic", "Protective Equipment", "Test Optic"));

        // Mock Admin authentication context
        CustomUserDetails adminPrincipal = new CustomUserDetails(
                1L, "admin", "pass", "Admin User", "admin@test.com", Role.ADMIN, null, null,
                Collections.emptyList()
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(adminPrincipal, null, adminPrincipal.getAuthorities())
        );
    }

    @Test
    @DisplayName("Purchase creates asset inventory and increments stock")
    public void testPurchaseIncreasesStock() {
        PurchaseRequest req = new PurchaseRequest(
                testBaseA.getId(), testEquipment.getId(), 25, LocalDate.now(), "TEST-PO-001");
        purchaseService.createPurchase(req);

        int currentStock = assetService.getStock(testBaseA.getId(), testEquipment.getId());
        assertEquals(25, currentStock, "Stock after purchase of 25 units should be exactly 25");
    }

    @Test
    @DisplayName("Transfer atomically decrements source base and increments destination base stock")
    public void testTransferStockMovement() {
        // Stock source with 50 units
        assetService.increaseStock(testBaseA, testEquipment, 50);

        TransferRequest req = new TransferRequest(
                testBaseA.getId(), testBaseB.getId(), testEquipment.getId(), 15,
                LocalDate.now(), "TEST-TR-001");
        transferService.createTransfer(req);

        int stockSource = assetService.getStock(testBaseA.getId(), testEquipment.getId());
        int stockDest = assetService.getStock(testBaseB.getId(), testEquipment.getId());

        assertEquals(35, stockSource, "Source base stock should be decreased by 15 (50 - 15 = 35)");
        assertEquals(15, stockDest, "Destination base stock should be increased by 15");
    }

    @Test
    @DisplayName("Transfer throws InsufficientInventoryException when requested quantity exceeds available stock")
    public void testTransferInsufficientStock() {
        // Source base has only 5 units
        assetService.increaseStock(testBaseA, testEquipment, 5);

        TransferRequest req = new TransferRequest(
                testBaseA.getId(), testBaseB.getId(), testEquipment.getId(), 20,
                LocalDate.now(), "TEST-TR-FAIL");

        assertThrows(InsufficientInventoryException.class, () -> transferService.createTransfer(req));

        // Ensure stock at source was not altered
        assertEquals(5, assetService.getStock(testBaseA.getId(), testEquipment.getId()));
    }

    @Test
    @DisplayName("Transfer to same base throws BadRequestException")
    public void testTransferSameBase() {
        TransferRequest req = new TransferRequest(
                testBaseA.getId(), testBaseA.getId(), testEquipment.getId(), 5,
                LocalDate.now(), "TEST-TR-SAME");

        assertThrows(BadRequestException.class, () -> transferService.createTransfer(req));
    }

    @Test
    @DisplayName("Assignment decreases available stock and rejects if insufficient")
    public void testAssignmentStockValidation() {
        assetService.increaseStock(testBaseA, testEquipment, 10);

        AssignmentRequest req = new AssignmentRequest(
                testBaseA.getId(), testEquipment.getId(), "Cpl. John Doe", 4, LocalDate.now());
        assignmentService.createAssignment(req);

        assertEquals(6, assetService.getStock(testBaseA.getId(), testEquipment.getId()));

        // Trying to assign 10 when only 6 left should fail
        AssignmentRequest failReq = new AssignmentRequest(
                testBaseA.getId(), testEquipment.getId(), "Cpl. Jane Smith", 10, LocalDate.now());
        assertThrows(InsufficientInventoryException.class, () -> assignmentService.createAssignment(failReq));
    }

    @Test
    @DisplayName("Expenditure decreases stock and rejects if insufficient")
    public void testExpenditureStockValidation() {
        assetService.increaseStock(testBaseA, testEquipment, 8);

        ExpenditureRequest req = new ExpenditureRequest(
                testBaseA.getId(), testEquipment.getId(), 3, LocalDate.now(), "Combat damage");
        expenditureService.createExpenditure(req);

        assertEquals(5, assetService.getStock(testBaseA.getId(), testEquipment.getId()));

        ExpenditureRequest failReq = new ExpenditureRequest(
                testBaseA.getId(), testEquipment.getId(), 10, LocalDate.now(), "Excess loss");
        assertThrows(InsufficientInventoryException.class, () -> expenditureService.createExpenditure(failReq));
    }
}
