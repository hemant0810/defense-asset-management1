package com.assetmanagement.service;

import com.assetmanagement.dto.request.PurchaseRequest;
import com.assetmanagement.entity.Base;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.entity.Purchase;
import com.assetmanagement.entity.Role;
import com.assetmanagement.exception.BadRequestException;
import com.assetmanagement.exception.ResourceNotFoundException;
import com.assetmanagement.exception.UnauthorizedException;
import com.assetmanagement.repository.BaseRepository;
import com.assetmanagement.repository.EquipmentTypeRepository;
import com.assetmanagement.repository.PurchaseRepository;
import com.assetmanagement.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AssetService assetService;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           BaseRepository baseRepository,
                           EquipmentTypeRepository equipmentTypeRepository,
                           AssetService assetService,
                           AuditLogService auditLogService,
                           AuthService authService) {
        this.purchaseRepository = purchaseRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.assetService = assetService;
        this.auditLogService = auditLogService;
        this.authService = authService;
    }

    @Transactional
    public Purchase createPurchase(PurchaseRequest request) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        if (currentUser == null) {
            throw new UnauthorizedException("User is not authenticated");
        }

        // RBAC check: ADMIN or LOGISTICS_OFFICER (restricted to assigned base)
        if (currentUser.getRole() == Role.BASE_COMMANDER) {
            throw new UnauthorizedException("Base Commanders are not authorized to create purchases");
        }
        if (currentUser.getRole() == Role.LOGISTICS_OFFICER) {
            if (currentUser.getBaseId() != null && !currentUser.getBaseId().equals(request.getBaseId())) {
                throw new UnauthorizedException("Logistics Officers can only create purchases for their assigned base");
            }
        }

        if (purchaseRepository.existsByReferenceNumber(request.getReferenceNumber())) {
            throw new BadRequestException("Purchase with reference number '" + request.getReferenceNumber() + "' already exists");
        }

        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base", "id", request.getBaseId()));

        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("EquipmentType", "id", request.getEquipmentTypeId()));

        Purchase purchase = new Purchase(
                base,
                equipmentType,
                request.getQuantity(),
                request.getPurchaseDate(),
                request.getReferenceNumber(),
                currentUser.getFullName()
        );

        Purchase saved = purchaseRepository.save(purchase);

        // Increase inventory stock atomically
        assetService.increaseStock(base, equipmentType, request.getQuantity());

        // Audit Log
        auditLogService.log("PURCHASE_CREATED", "PURCHASE", saved.getId(),
                String.format("Recorded purchase of %d units of %s for %s. Ref: %s",
                        saved.getQuantity(), equipmentType.getName(), base.getName(), saved.getReferenceNumber()));

        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Purchase> getPurchases(Long baseId, Long equipmentTypeId,
                                       LocalDate startDate, LocalDate endDate,
                                       String search, Pageable pageable) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        Long effectiveBaseId = baseId;

        // If Base Commander or Logistics Officer, force filter to their assigned base if specified
        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getBaseId() != null) {
                effectiveBaseId = currentUser.getBaseId();
            }
        }

        return purchaseRepository.findWithFilters(effectiveBaseId, equipmentTypeId, startDate, endDate, search, pageable);
    }

    @Transactional(readOnly = true)
    public Purchase getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", id));

        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getBaseId() != null && !currentUser.getBaseId().equals(purchase.getBase().getId())) {
                throw new UnauthorizedException("You do not have permission to view purchases from this base");
            }
        }
        return purchase;
    }
}
