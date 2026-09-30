package com.assetmanagement.repository;

import com.assetmanagement.entity.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, Long> {
    Optional<EquipmentType> findByName(String name);
    boolean existsByName(String name);
    List<EquipmentType> findByCategory(String category);
}
