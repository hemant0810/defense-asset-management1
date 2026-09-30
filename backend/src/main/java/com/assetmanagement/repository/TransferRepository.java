package com.assetmanagement.repository;

import com.assetmanagement.entity.Transfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {

    boolean existsByReferenceNumber(String referenceNumber);

    @Query("SELECT t FROM Transfer t WHERE " +
           "(:baseId IS NULL OR t.fromBase.id = :baseId OR t.toBase.id = :baseId) AND " +
           "(:fromBaseId IS NULL OR t.fromBase.id = :fromBaseId) AND " +
           "(:toBaseId IS NULL OR t.toBase.id = :toBaseId) AND " +
           "(:equipmentTypeId IS NULL OR t.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR t.transferDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transferDate <= :endDate) AND " +
           "(:search IS NULL OR LOWER(t.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.fromBase.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.toBase.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.equipmentType.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Transfer> findWithFilters(
            @Param("baseId") Long baseId,
            @Param("fromBaseId") Long fromBaseId,
            @Param("toBaseId") Long toBaseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t WHERE " +
           "(:toBaseId IS NULL OR t.toBase.id = :toBaseId) AND " +
           "(:equipmentTypeId IS NULL OR t.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR t.transferDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transferDate <= :endDate)")
    Integer sumTransferIn(
            @Param("toBaseId") Long toBaseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Transfer t WHERE " +
           "(:fromBaseId IS NULL OR t.fromBase.id = :fromBaseId) AND " +
           "(:equipmentTypeId IS NULL OR t.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR t.transferDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transferDate <= :endDate)")
    Integer sumTransferOut(
            @Param("fromBaseId") Long fromBaseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transfer t WHERE " +
           "(:toBaseId IS NULL OR t.toBase.id = :toBaseId) AND " +
           "(:equipmentTypeId IS NULL OR t.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR t.transferDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transferDate <= :endDate) ORDER BY t.transferDate DESC")
    List<Transfer> findTransferInList(
            @Param("toBaseId") Long toBaseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transfer t WHERE " +
           "(:fromBaseId IS NULL OR t.fromBase.id = :fromBaseId) AND " +
           "(:equipmentTypeId IS NULL OR t.equipmentType.id = :equipmentTypeId) AND " +
           "(:startDate IS NULL OR t.transferDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.transferDate <= :endDate) ORDER BY t.transferDate DESC")
    List<Transfer> findTransferOutList(
            @Param("fromBaseId") Long fromBaseId,
            @Param("equipmentTypeId") Long equipmentTypeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
