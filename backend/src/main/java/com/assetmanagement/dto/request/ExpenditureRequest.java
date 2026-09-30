package com.assetmanagement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ExpenditureRequest {

    @NotNull(message = "Base ID is required")
    private Long baseId;

    @NotNull(message = "Equipment Type ID is required")
    private Long equipmentTypeId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotNull(message = "Expenditure date is required")
    private LocalDate expenditureDate;

    @NotBlank(message = "Reason is required")
    private String reason;

    public ExpenditureRequest() {
    }

    public ExpenditureRequest(Long baseId, Long equipmentTypeId, Integer quantity, LocalDate expenditureDate, String reason) {
        this.baseId = baseId;
        this.equipmentTypeId = equipmentTypeId;
        this.quantity = quantity;
        this.expenditureDate = expenditureDate;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getBaseId() {
        return baseId;
    }

    public void setBaseId(Long baseId) {
        this.baseId = baseId;
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

    public LocalDate getExpenditureDate() {
        return expenditureDate;
    }

    public void setExpenditureDate(LocalDate expenditureDate) {
        this.expenditureDate = expenditureDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
