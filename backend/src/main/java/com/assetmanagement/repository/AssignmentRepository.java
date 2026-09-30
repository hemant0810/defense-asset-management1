package com.assetmanagement.repository;

import com.assetmanagement.entity.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("SELECT a FROM Assignment a WHERE " +
           "(:baseId IS NULL OR a.base.id = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR a.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR a.assignmentDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.assignmentDate <= :endDate) AND " +
           "(:search IS NULL OR LOWER(a.personnelName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.base.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.equipmentType.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Assignment> findWithFilters(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(a.quantity), 0) FROM Assignment a WHERE " +
           "(:baseId IS NULL OR a.base.id = :baseId) AND " +
           "(:equipmentTypeId IS NULL OR a.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR a.assignmentDate >= :startDate) AND " +
           "(:endDate IS NULL OR a.assignmentDate <= :endDate)")
    Integer sumQuantity(
            @Param("baseId") Long baseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
