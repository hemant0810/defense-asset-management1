package com.assetmanagement.service;

import com.assetmanagement.dto.request.TransferRequest;
import com.assetmanagement.entity.Base;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.entity.Role;
import com.assetmanagement.entity.Transfer;
import com.assetmanagement.exception.BadRequestException;
import com.assetmanagement.exception.ResourceNotFoundException;
import com.assetmanagement.exception.UnauthorizedException;
import com.assetmanagement.repository.BaseRepository;
import com.assetmanagement.repository.EquipmentTypeRepository;
import com.assetmanagement.repository.TransferRepository;
import com.assetmanagement.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AssetService assetService;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    public TransferService(TransferRepository transferRepository,
                           BaseRepository baseRepository,
                           EquipmentTypeRepository equipmentTypeRepository,
                           AssetService assetService,
                           AuditLogService auditLogService,
                           AuthService authService) {
        this.transferRepository = transferRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.assetService = assetService;
        this.auditLogService = auditLogService;
        this.authService = authService;
    }

    @Transactional(rollbackFor = Exception.class)
    public Transfer createTransfer(TransferRequest request) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        if (currentUser == null) {
            throw new UnauthorizedException("User is not authenticated");
        }

        // Validation: From Base and To Base cannot be the same
        if (request.getFromBaseId().equals(request.getToBaseId())) {
            throw new BadRequestException("Source base and destination base cannot be the same");
        }

        // RBAC validation: ADMIN or LOGISTICS_OFFICER (must originate from assigned base)
        if (currentUser.getRole() == Role.BASE_COMMANDER) {
            throw new UnauthorizedException("Base Commanders are not authorized to initiate transfers");
        }
        if (currentUser.getRole() == Role.LOGISTICS_OFFICER) {
            if (currentUser.getBaseId() != null && !currentUser.getBaseId().equals(request.getFromBaseId())) {
                throw new UnauthorizedException("Logistics Officers can only initiate transfers from their assigned base");
            }
        }

        if (transferRepository.existsByReferenceNumber(request.getReferenceNumber())) {
            throw new BadRequestException("Transfer with reference number '" + request.getReferenceNumber() + "' already exists");
        }

        Base fromBase = baseRepository.findById(request.getFromBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Source Base", "id", request.getFromBaseId()));

        Base toBase = baseRepository.findById(request.getToBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination Base", "id", request.getToBaseId()));

        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("EquipmentType", "id", request.getEquipmentTypeId()));

        // Atomic step 1: Check and decrease inventory at source base (will throw InsufficientInventoryException if not enough)
        assetService.decreaseStock(fromBase, equipmentType, request.getQuantity());

        // Atomic step 2: Increase inventory at destination base
        assetService.increaseStock(toBase, equipmentType, request.getQuantity());

        // Step 3: Record transfer history
        Transfer transfer = new Transfer(
                fromBase,
                toBase,
                equipmentType,
                request.getQuantity(),
                request.getTransferDate(),
                request.getReferenceNumber(),
                "COMPLETED",
                currentUser.getFullName()
        );

        Transfer saved = transferRepository.save(transfer);

        // Step 4: Record Audit Log
        auditLogService.log("TRANSFER_COMPLETED", "TRANSFER", saved.getId(),
                String.format("Transferred %d units of %s from %s to %s. Ref: %s",
                        saved.getQuantity(), equipmentType.getName(), fromBase.getName(), toBase.getName(), saved.getReferenceNumber()));

        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Transfer> getTransfers(Long baseId, Long fromBaseId, Long toBaseId,
                                      Long equipmentTypeId, LocalDate startDate, LocalDate endDate,
                                      String search, Pageable pageable) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        Long effectiveBaseId = baseId;

        // If Base Commander or Logistics Officer, constrain to transfers involving their base
        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getBaseId() != null) {
                effectiveBaseId = currentUser.getBaseId();
            }
        }

        return transferRepository.findWithFilters(effectiveBaseId, fromBaseId, toBaseId, 
                equipmentTypeId, startDate, endDate, search, pageable);
    }
}
