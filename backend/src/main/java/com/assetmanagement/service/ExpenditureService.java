package com.assetmanagement.service;

import com.assetmanagement.dto.request.ExpenditureRequest;
import com.assetmanagement.entity.Base;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.entity.Expenditure;
import com.assetmanagement.entity.Role;
import com.assetmanagement.exception.ResourceNotFoundException;
import com.assetmanagement.exception.UnauthorizedException;
import com.assetmanagement.repository.BaseRepository;
import com.assetmanagement.repository.EquipmentTypeRepository;
import com.assetmanagement.repository.ExpenditureRepository;
import com.assetmanagement.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ExpenditureService {

    private final ExpenditureRepository expenditureRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AssetService assetService;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    public ExpenditureService(ExpenditureRepository expenditureRepository,
                              BaseRepository baseRepository,
                              EquipmentTypeRepository equipmentTypeRepository,
                              AssetService assetService,
                              AuditLogService auditLogService,
                              AuthService authService) {
        this.expenditureRepository = expenditureRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.assetService = assetService;
        this.auditLogService = auditLogService;
        this.authService = authService;
    }

    @Transactional(rollbackFor = Exception.class)
    public Expenditure createExpenditure(ExpenditureRequest request) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        if (currentUser == null) {
            throw new UnauthorizedException("User is not authenticated");
        }

        // RBAC check: ADMIN or BASE_COMMANDER (for own base)
        if (currentUser.getRole() == Role.LOGISTICS_OFFICER) {
            throw new UnauthorizedException("Logistics Officers are not authorized to record equipment expenditures");
        }
        if (currentUser.getRole() == Role.BASE_COMMANDER) {
            if (currentUser.getBaseId() != null && !currentUser.getBaseId().equals(request.getBaseId())) {
                throw new UnauthorizedException("Base Commanders can only record expenditures for their assigned base");
            }
        }

        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base", "id", request.getBaseId()));

        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("EquipmentType", "id", request.getEquipmentTypeId()));

        // Check inventory and decrease stock
        assetService.decreaseStock(base, equipmentType, request.getQuantity());

        Expenditure expenditure = new Expenditure(
                base,
                equipmentType,
                request.getQuantity(),
                request.getExpenditureDate(),
                request.getReason(),
                currentUser.getFullName()
        );

        Expenditure saved = expenditureRepository.save(expenditure);

        // Audit Log
        auditLogService.log("EXPENDITURE_RECORDED", "EXPENDITURE", saved.getId(),
                String.format("Expended %d units of %s at %s. Reason: %s",
                        saved.getQuantity(), equipmentType.getName(), base.getName(), saved.getReason()));

        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Expenditure> getExpenditures(Long baseId, Long equipmentTypeId,
                                            LocalDate startDate, LocalDate endDate,
                                            String search, Pageable pageable) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        Long effectiveBaseId = baseId;

        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getBaseId() != null) {
                effectiveBaseId = currentUser.getBaseId();
            }
        }

        return expenditureRepository.findWithFilters(effectiveBaseId, equipmentTypeId, startDate, endDate, search, pageable);
    }
}
