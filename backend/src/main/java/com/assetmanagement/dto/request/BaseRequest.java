package com.assetmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;

public class BaseRequest {

    @NotBlank(message = "Base name is required")
    private String name;

    @NotBlank(message = "Base location is required")
    private String location;

    public BaseRequest() {
    }

    public BaseRequest(String name, String location) {
        this.name = name;
        this.location = location;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
