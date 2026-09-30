package com.assetmanagement.service;

import com.assetmanagement.dto.request.BaseRequest;
import com.assetmanagement.entity.Base;
import com.assetmanagement.exception.BadRequestException;
import com.assetmanagement.exception.ResourceNotFoundException;
import com.assetmanagement.repository.BaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BaseService {

    private final BaseRepository baseRepository;
    private final AuditLogService auditLogService;

    public BaseService(BaseRepository baseRepository, AuditLogService auditLogService) {
        this.baseRepository = baseRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<Base> getAllBases() {
        return baseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Base getBaseById(Long id) {
        return baseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Base", "id", id));
    }

    @Transactional
    public Base createBase(BaseRequest request) {
        if (baseRepository.existsByName(request.getName())) {
            throw new BadRequestException("Base with name '" + request.getName() + "' already exists");
        }
        Base base = new Base(request.getName(), request.getLocation());
        Base saved = baseRepository.save(base);

        auditLogService.log("BASE_CREATED", "BASE", saved.getId(),
                "Created new base: " + saved.getName() + " located at " + saved.getLocation());
        return saved;
    }

    @Transactional
    public Base updateBase(Long id, BaseRequest request) {
        Base base = getBaseById(id);
        if (!base.getName().equalsIgnoreCase(request.getName()) && baseRepository.existsByName(request.getName())) {
            throw new BadRequestException("Base with name '" + request.getName() + "' already exists");
        }
        base.setName(request.getName());
        base.setLocation(request.getLocation());
        Base updated = baseRepository.save(base);

        auditLogService.log("BASE_UPDATED", "BASE", updated.getId(),
                "Updated base: " + updated.getName() + " located at " + updated.getLocation());
        return updated;
    }

    @Transactional
    public void deleteBase(Long id) {
        Base base = getBaseById(id);
        baseRepository.delete(base);
        auditLogService.log("BASE_DELETED", "BASE", id, "Deleted base: " + base.getName());
    }
}
