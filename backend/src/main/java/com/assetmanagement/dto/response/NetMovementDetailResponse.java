package com.assetmanagement.dto.response;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class NetMovementDetailResponse {

    private int totalPurchases;
    private int totalTransferIn;
    private int totalTransferOut;
    private int netMovement;

    private List<MovementItem> purchases = new ArrayList<>();
    private List<MovementItem> transfersIn = new ArrayList<>();
    private List<MovementItem> transfersOut = new ArrayList<>();

    public NetMovementDetailResponse() {
    }

    public static class MovementItem {
        private String type; // PURCHASE, TRANSFER_IN, TRANSFER_OUT
        private String referenceNumber;
        private String baseName;
        private String fromBaseName;
        private String toBaseName;
        private String equipmentTypeName;
        private int quantity;
        private LocalDate date;
        private String createdBy;

        public MovementItem() {
        }

        public MovementItem(String type, String referenceNumber, String baseName, 
                            String fromBaseName, String toBaseName, String equipmentTypeName, 
                            int quantity, LocalDate date, String createdBy) {
            this.type = type;
            this.referenceNumber = referenceNumber;
            this.baseName = baseName;
            this.fromBaseName = fromBaseName;
            this.toBaseName = toBaseName;
            this.equipmentTypeName = equipmentTypeName;
            this.quantity = quantity;
            this.date = date;
            this.createdBy = createdBy;
        }

        // Getters and Setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getReferenceNumber() {
            return referenceNumber;
        }

        public void setReferenceNumber(String referenceNumber) {
            this.referenceNumber = referenceNumber;
        }

        public String getBaseName() {
            return baseName;
        }

        public void setBaseName(String baseName) {
            this.baseName = baseName;
        }

        public String getFromBaseName() {
            return fromBaseName;
        }

        public void setFromBaseName(String fromBaseName) {
            this.fromBaseName = fromBaseName;
        }

        public String getToBaseName() {
            return toBaseName;
        }

        public void setToBaseName(String toBaseName) {
            this.toBaseName = toBaseName;
        }

        public String getEquipmentTypeName() {
            return equipmentTypeName;
        }

        public void setEquipmentTypeName(String equipmentTypeName) {
            this.equipmentTypeName = equipmentTypeName;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public String getCreatedBy() {
            return createdBy;
        }

        public void setCreatedBy(String createdBy) {
            this.createdBy = createdBy;
        }
    }

    // Getters and Setters
    public int getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(int totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public int getTotalTransferIn() {
        return totalTransferIn;
    }

    public void setTotalTransferIn(int totalTransferIn) {
        this.totalTransferIn = totalTransferIn;
    }

    public int getTotalTransferOut() {
        return totalTransferOut;
    }

    public void setTotalTransferOut(int totalTransferOut) {
        this.totalTransferOut = totalTransferOut;
    }

    public int getNetMovement() {
        return netMovement;
    }

    public void setNetMovement(int netMovement) {
        this.netMovement = netMovement;
    }

    public List<MovementItem> getPurchases() {
        return purchases;
    }

    public void setPurchases(List<MovementItem> purchases) {
        this.purchases = purchases;
    }

    public List<MovementItem> getTransfersIn() {
        return transfersIn;
    }

    public void setTransfersIn(List<MovementItem> transfersIn) {
        this.transfersIn = transfersIn;
    }

    public List<MovementItem> getTransfersOut() {
        return transfersOut;
    }

    public void setTransfersOut(List<MovementItem> transfersOut) {
        this.transfersOut = transfersOut;
    }
}
