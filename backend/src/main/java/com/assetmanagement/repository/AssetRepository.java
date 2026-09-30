package com.assetmanagement.repository;

import com.assetmanagement.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByBaseIdAndEquipmentTypeId(Long baseId, Long equipmentTypeId);
    List<Asset> findByBaseId(Long baseId);
    List<Asset> findByEquipmentTypeId(Long equipmentTypeId);

    @Query("SELECT COALESCE(SUM(a.quantity), 0) FROM Asset a WHERE " +
           "(:baseId IS NULL OR a.base.id = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR a.equipmentType.id = :equipmentTypeId)")
    Integer getTotalStock(@Param("baseId") Long baseId, @Param("equipmentTypeId") Long equipmentTypeId);
}
