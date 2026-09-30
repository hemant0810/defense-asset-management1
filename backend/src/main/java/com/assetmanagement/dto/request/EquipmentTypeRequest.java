package com.assetmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;

public class EquipmentTypeRequest {

    @NotBlank(message = "Equipment name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;

    public EquipmentTypeRequest() {
    }

    public EquipmentTypeRequest(String name, String category, String description) {
        this.name = name;
        this.category = category;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
