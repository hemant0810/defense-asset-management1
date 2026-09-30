package com.assetmanagement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class TransferRequest {

    @NotNull(message = "Origin (From) Base ID is required")
    private Long fromBaseId;

    @NotNull(message = "Destination (To) Base ID is required")
    private Long toBaseId;

    @NotNull(message = "Equipment Type ID is required")
    private Long equipmentTypeId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotNull(message = "Transfer date is required")
    private LocalDate transferDate;

    @NotBlank(message = "Reference number is required")
    private String referenceNumber;

    public TransferRequest() {
    }

    public TransferRequest(Long fromBaseId, Long toBaseId, Long equipmentTypeId, 
                           Integer quantity, LocalDate transferDate, String referenceNumber) {
        this.fromBaseId = fromBaseId;
        this.toBaseId = toBaseId;
        this.equipmentTypeId = equipmentTypeId;
        this.quantity = quantity;
        this.transferDate = transferDate;
        this.referenceNumber = referenceNumber;
    }

    // Getters and Setters
    public Long getFromBaseId() {
        return fromBaseId;
    }

    public void setFromBaseId(Long fromBaseId) {
        this.fromBaseId = fromBaseId;
    }

    public Long getToBaseId() {
        return toBaseId;
    }

    public void setToBaseId(Long toBaseId) {
        this.toBaseId = toBaseId;
    }

    public Long getEquipmentTypeId() {
        return equipmentTypeId;
    }

    public void setEquipmentTypeId(Long equipmentTypeId) {
        this.equipmentTypeId = equipmentTypeId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDate getTransferDate() {
        return transferDate;
    }

    public void setTransferDate(LocalDate transferDate) {
        this.transferDate = transferDate;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }
}
