package com.assetmanagement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AssignmentRequest {

    @NotNull(message = "Base ID is required")
    private Long baseId;

    @NotNull(message = "Equipment Type ID is required")
    private Long equipmentTypeId;

    @NotBlank(message = "Personnel name is required")
    private String personnelName;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotNull(message = "Assignment date is required")
    private LocalDate assignmentDate;

    public AssignmentRequest() {
    }

    public AssignmentRequest(Long baseId, Long equipmentTypeId, String personnelName, Integer quantity, LocalDate assignmentDate) {
        this.baseId = baseId;
        this.equipmentTypeId = equipmentTypeId;
        this.personnelName = personnelName;
        this.quantity = quantity;
        this.assignmentDate = assignmentDate;
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

    public String getPersonnelName() {
        return personnelName;
    }

    public void setPersonnelName(String personnelName) {
        this.personnelName = personnelName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDate getAssignmentDate() {
        return assignmentDate;
    }

    public void setAssignmentDate(LocalDate assignmentDate) {
        this.assignmentDate = assignmentDate;
    }
}
