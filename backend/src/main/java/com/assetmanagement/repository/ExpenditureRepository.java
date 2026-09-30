package com.assetmanagement.repository;

import com.assetmanagement.entity.Expenditure;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ExpenditureRepository extends JpaRepository<Expenditure, Long> {

    @Query("SELECT e FROM Expenditure e WHERE " +
           "(:baseId IS NULL OR e.base.id = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR e.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR e.expenditureDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.expenditureDate <= :endDate) AND " +
           "(:search IS NULL OR LOWER(e.reason) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.base.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.equipmentType.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Expenditure> findWithFilters(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.quantity), 0) FROM Expenditure e WHERE " +
           "(:baseId IS NULL OR e.base.id = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR e.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR e.expenditureDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.expenditureDate <= :endDate)")
    Integer sumQuantity(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
