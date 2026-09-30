package com.assetmanagement.service;

import com.assetmanagement.dto.request.AssignmentRequest;
import com.assetmanagement.entity.Assignment;
import com.assetmanagement.entity.Base;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.entity.Role;
import com.assetmanagement.exception.ResourceNotFoundException;
import com.assetmanagement.exception.UnauthorizedException;
import com.assetmanagement.repository.AssignmentRepository;
import com.assetmanagement.repository.BaseRepository;
import com.assetmanagement.repository.EquipmentTypeRepository;
import com.assetmanagement.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AssetService assetService;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             BaseRepository baseRepository,
                             EquipmentTypeRepository equipmentTypeRepository,
                             AssetService assetService,
                             AuditLogService auditLogService,
                             AuthService authService) {
        this.assignmentRepository = assignmentRepository;
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.assetService = assetService;
        this.auditLogService = auditLogService;
        this.authService = authService;
    }

    @Transactional(rollbackFor = Exception.class)
    public Assignment createAssignment(AssignmentRequest request) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        if (currentUser == null) {
            throw new UnauthorizedException("User is not authenticated");
        }

        // RBAC check: ADMIN or BASE_COMMANDER (for own base)
        if (currentUser.getRole() == Role.LOGISTICS_OFFICER) {
            throw new UnauthorizedException("Logistics Officers are not authorized to assign equipment to personnel");
        }
        if (currentUser.getRole() == Role.BASE_COMMANDER) {
            if (currentUser.getBaseId() != null && !currentUser.getBaseId().equals(request.getBaseId())) {
                throw new UnauthorizedException("Base Commanders can only assign equipment within their assigned base");
            }
        }

        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base", "id", request.getBaseId()));

        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("EquipmentType", "id", request.getEquipmentTypeId()));

        // Atomic check and decrease available inventory
        assetService.decreaseStock(base, equipmentType, request.getQuantity());

        // Save Assignment record
        Assignment assignment = new Assignment(
                base,
                equipmentType,
                request.getPersonnelName(),
                request.getQuantity(),
                request.getAssignmentDate(),
                currentUser.getFullName()
        );

        Assignment saved = assignmentRepository.save(assignment);

        // Audit Log
        auditLogService.log("ASSIGNMENT_CREATED", "ASSIGNMENT", saved.getId(),
                String.format("Assigned %d units of %s to %s at %s",
                        saved.getQuantity(), equipmentType.getName(), saved.getPersonnelName(), base.getName()));

        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Assignment> getAssignments(Long baseId, Long equipmentTypeId,
                                          LocalDate startDate, LocalDate endDate,
                                          String search, Pageable pageable) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        Long effectiveBaseId = baseId;

        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getBaseId() != null) {
                effectiveBaseId = currentUser.getBaseId();
            }
        }

        return assignmentRepository.findWithFilters(effectiveBaseId, equipmentTypeId, startDate, endDate, search, pageable);
    }
}
