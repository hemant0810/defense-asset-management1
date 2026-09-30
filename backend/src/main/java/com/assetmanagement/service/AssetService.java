package com.assetmanagement.service;

import com.assetmanagement.entity.Asset;
import com.assetmanagement.entity.Base;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.exception.InsufficientInventoryException;
import com.assetmanagement.repository.AssetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Transactional(readOnly = true)
    public int getStock(Long baseId, Long equipmentTypeId) {
        return assetRepository.findByBaseIdAndEquipmentTypeId(baseId, equipmentTypeId)
                .map(Asset::getQuantity)
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public void validateStockAvailability(Base base, EquipmentType equipmentType, int requiredQuantity) {
        int currentStock = getStock(base.getId(), equipmentType.getId());
        if (currentStock < requiredQuantity) {
            throw new InsufficientInventoryException(
                    equipmentType.getName(), requiredQuantity, currentStock);
        }
    }

    @Transactional
    public Asset increaseStock(Base base, EquipmentType equipmentType, int quantity) {
        Optional<Asset> existing = assetRepository.findByBaseIdAndEquipmentTypeId(base.getId(), equipmentType.getId());
        Asset asset;
        if (existing.isPresent()) {
            asset = existing.get();
            asset.setQuantity(asset.getQuantity() + quantity);
        } else {
            asset = new Asset(equipmentType, base, quantity, "OPERATIONAL");
        }
        return assetRepository.save(asset);
    }

    @Transactional
    public Asset decreaseStock(Base base, EquipmentType equipmentType, int quantity) {
        validateStockAvailability(base, equipmentType, quantity);

        Asset asset = assetRepository.findByBaseIdAndEquipmentTypeId(base.getId(), equipmentType.getId())
                .orElseThrow(() -> new InsufficientInventoryException(equipmentType.getName(), quantity, 0));

        asset.setQuantity(asset.getQuantity() - quantity);
        return assetRepository.save(asset);
    }

    @Transactional(readOnly = true)
    public List<Asset> getAssetsByBase(Long baseId) {
        if (baseId != null) {
            return assetRepository.findByBaseId(baseId);
        }
        return assetRepository.findAll();
    }
}
