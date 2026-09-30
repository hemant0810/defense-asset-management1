package com.assetmanagement.dto.response;

public class DashboardSummaryResponse {

    private int openingBalance;
    private int purchases;
    private int transferIn;
    private int transferOut;
    private int netMovement;
    private int closingBalance;
    private int assigned;
    private int expended;
    private int availableStock;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(int openingBalance, int purchases, int transferIn, int transferOut,
                                    int netMovement, int closingBalance, int assigned, int expended,
                                    int availableStock) {
        this.openingBalance = openingBalance;
        this.purchases = purchases;
        this.transferIn = transferIn;
        this.transferOut = transferOut;
        this.netMovement = netMovement;
        this.closingBalance = closingBalance;
        this.assigned = assigned;
        this.expended = expended;
        this.availableStock = availableStock;
    }

    // Getters and Setters
    public int getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(int openingBalance) {
        this.openingBalance = openingBalance;
    }

    public int getPurchases() {
        return purchases;
    }

    public void setPurchases(int purchases) {
        this.purchases = purchases;
    }

    public int getTransferIn() {
        return transferIn;
    }

    public void setTransferIn(int transferIn) {
        this.transferIn = transferIn;
    }

    public int getTransferOut() {
        return transferOut;
    }

    public void setTransferOut(int transferOut) {
        this.transferOut = transferOut;
    }

    public int getNetMovement() {
        return netMovement;
    }

    public void setNetMovement(int netMovement) {
        this.netMovement = netMovement;
    }

    public int getClosingBalance() {
        return closingBalance;
    }

    public void setClosingBalance(int closingBalance) {
        this.closingBalance = closingBalance;
    }

    public int getAssigned() {
        return assigned;
    }

    public void setAssigned(int assigned) {
        this.assigned = assigned;
    }

    public int getExpended() {
        return expended;
    }

    public void setExpended(int expended) {
        this.expended = expended;
    }

    public int getAvailableStock() {
        return availableStock;
    }

    public void setAvailableStock(int availableStock) {
        this.availableStock = availableStock;
    }
}
