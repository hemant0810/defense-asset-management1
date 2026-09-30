package com.assetmanagement.repository;

import com.assetmanagement.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    boolean existsByReferenceNumber(String referenceNumber);

    @Query("SELECT p FROM Purchase p WHERE " +
           "(:baseId IS NULL OR p.base.id = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR p.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR p.purchaseDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.purchaseDate <= :endDate) AND " +
           "(:search IS NULL OR LOWER(p.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.base.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.equipmentType.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Purchase> findWithFilters(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p WHERE " +
           "(:baseId IS NULL OR p.base.id = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR p.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR p.purchaseDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.purchaseDate <= :endDate)")
    Integer sumQuantity(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM Purchase p WHERE " +
           "(:baseId IS NULL OR p.base.id = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR p.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR p.purchaseDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.purchaseDate <= :endDate) ORDER BY p.purchaseDate DESC")
    List<Purchase> findListWithFilters(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
