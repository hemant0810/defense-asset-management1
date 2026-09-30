package com.assetmanagement.service;

import com.assetmanagement.dto.request.EquipmentTypeRequest;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.exception.BadRequestException;
import com.assetmanagement.exception.ResourceNotFoundException;
import com.assetmanagement.repository.EquipmentTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EquipmentTypeService {

    private final EquipmentTypeRepository equipmentTypeRepository;
    private final AuditLogService auditLogService;

    public EquipmentTypeService(EquipmentTypeRepository equipmentTypeRepository,
                                AuditLogService auditLogService) {
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<EquipmentType> getAllEquipmentTypes() {
        return equipmentTypeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public EquipmentType getEquipmentTypeById(Long id) {
        return equipmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EquipmentType", "id", id));
    }

    @Transactional
    public EquipmentType createEquipmentType(EquipmentTypeRequest request) {
        if (equipmentTypeRepository.existsByName(request.getName())) {
            throw new BadRequestException("Equipment Type with name '" + request.getName() + "' already exists");
        }
        EquipmentType equipmentType = new EquipmentType(
                request.getName(), request.getCategory(), request.getDescription());
        EquipmentType saved = equipmentTypeRepository.save(equipmentType);

        auditLogService.log("EQUIPMENT_TYPE_CREATED", "EQUIPMENT_TYPE", saved.getId(),
                "Added equipment type: " + saved.getName() + " in category " + saved.getCategory());
        return saved;
    }

    @Transactional
    public EquipmentType updateEquipmentType(Long id, EquipmentTypeRequest request) {
        EquipmentType equipmentType = getEquipmentTypeById(id);
        if (!equipmentType.getName().equalsIgnoreCase(request.getName()) && 
            equipmentTypeRepository.existsByName(request.getName())) {
            throw new BadRequestException("Equipment Type with name '" + request.getName() + "' already exists");
        }
        equipmentType.setName(request.getName());
        equipmentType.setCategory(request.getCategory());
        equipmentType.setDescription(request.getDescription());
        EquipmentType updated = equipmentTypeRepository.save(equipmentType);

        auditLogService.log("EQUIPMENT_TYPE_UPDATED", "EQUIPMENT_TYPE", updated.getId(),
                "Updated equipment type: " + updated.getName());
        return updated;
    }

    @Transactional
    public void deleteEquipmentType(Long id) {
        EquipmentType equipmentType = getEquipmentTypeById(id);
        equipmentTypeRepository.delete(equipmentType);
        auditLogService.log("EQUIPMENT_TYPE_DELETED", "EQUIPMENT_TYPE", id,
                "Deleted equipment type: " + equipmentType.getName());
    }
}
