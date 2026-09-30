package com.assetmanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InsufficientInventoryException extends RuntimeException {
    public InsufficientInventoryException(String message) {
        super(message);
    }

    public InsufficientInventoryException(String equipmentName, int requested, int available) {
        super(String.format("Insufficient inventory for '%s'. Requested: %d, Available: %d", 
                equipmentName, requested, available));
    }
}
