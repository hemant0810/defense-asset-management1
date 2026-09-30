package com.assetmanagement.service;

import com.assetmanagement.dto.response.DashboardSummaryResponse;
import com.assetmanagement.dto.response.NetMovementDetailResponse;
import com.assetmanagement.entity.Purchase;
import com.assetmanagement.entity.Role;
import com.assetmanagement.entity.Transfer;
import com.assetmanagement.repository.AssetRepository;
import com.assetmanagement.repository.AssignmentRepository;
import com.assetmanagement.repository.ExpenditureRepository;
import com.assetmanagement.repository.PurchaseRepository;
import com.assetmanagement.repository.TransferRepository;
import com.assetmanagement.security.CustomUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final PurchaseRepository purchaseRepository;
    private final TransferRepository transferRepository;
    private final AssignmentRepository assignmentRepository;
    private final ExpenditureRepository expenditureRepository;
    private final AssetRepository assetRepository;
    private final AuthService authService;

    public DashboardService(PurchaseRepository purchaseRepository,
                            TransferRepository transferRepository,
                            AssignmentRepository assignmentRepository,
                            ExpenditureRepository expenditureRepository,
                            AssetRepository assetRepository,
                            AuthService authService) {
        this.purchaseRepository = purchaseRepository;
        this.transferRepository = transferRepository;
        this.assignmentRepository = assignmentRepository;
        this.expenditureRepository = expenditureRepository;
        this.assetRepository = assetRepository;
        this.authService = authService;
    }

    private Long resolveEffectiveBaseId(Long requestedBaseId) {
        CustomUserDetails currentUser = authService.getCurrentUserDetails();
        if (currentUser != null && currentUser.getRole() != Role.ADMIN) {
            if (currentUser.getBaseId() != null) {
                return currentUser.getBaseId();
            }
        }
        return requestedBaseId;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long baseId, Long equipmentTypeId,
                                               LocalDate startDate, LocalDate endDate) {
        Long effectiveBaseId = resolveEffectiveBaseId(baseId);

        // 1. Calculate Opening Balance (movements before startDate if startDate is present)
        int openingBalance = 0;
        if (startDate != null) {
            LocalDate preStartDate = startDate.minusDays(1);
            int priorPurchases = purchaseRepository.sumQuantity(effectiveBaseId, equipmentTypeId, null, preStartDate);
            int priorTransferIn = transferRepository.sumTransferIn(effectiveBaseId, equipmentTypeId, null, preStartDate);
            int priorTransferOut = transferRepository.sumTransferOut(effectiveBaseId, equipmentTypeId, null, preStartDate);
            int priorExpended = expenditureRepository.sumQuantity(effectiveBaseId, equipmentTypeId, null, preStartDate);

            openingBalance = priorPurchases + priorTransferIn - priorTransferOut - priorExpended;
            if (openingBalance < 0) {
                openingBalance = 0;
            }
        }

        // 2. Movements in current selected period
        int purchases = purchaseRepository.sumQuantity(effectiveBaseId, equipmentTypeId, startDate, endDate);
        int transferIn = transferRepository.sumTransferIn(effectiveBaseId, equipmentTypeId, startDate, endDate);
        int transferOut = transferRepository.sumTransferOut(effectiveBaseId, equipmentTypeId, startDate, endDate);
        int assigned = assignmentRepository.sumQuantity(effectiveBaseId, equipmentTypeId, startDate, endDate);
        int expended = expenditureRepository.sumQuantity(effectiveBaseId, equipmentTypeId, startDate, endDate);

        // 3. Net Movement formula: Purchases + Transfer In - Transfer Out
        int netMovement = purchases + transferIn - transferOut;

        // 4. Closing Balance calculation
        int closingBalance = openingBalance + netMovement - expended;
        if (closingBalance < 0) {
            closingBalance = 0;
        }

        // 5. Current real-time available stock
        int availableStock = assetRepository.getTotalStock(effectiveBaseId, equipmentTypeId);

        return new DashboardSummaryResponse(
                openingBalance,
                purchases,
                transferIn,
                transferOut,
                netMovement,
                closingBalance,
                assigned,
                expended,
                availableStock
        );
    }

    @Transactional(readOnly = true)
    public NetMovementDetailResponse getNetMovementDetails(Long baseId, Long equipmentTypeId,
                                                          LocalDate startDate, LocalDate endDate) {
        Long effectiveBaseId = resolveEffectiveBaseId(baseId);

        NetMovementDetailResponse response = new NetMovementDetailResponse();

        // 1. Fetch Purchases
        List<Purchase> purchaseList = purchaseRepository.findListWithFilters(
                effectiveBaseId, equipmentTypeId, startDate, endDate);
        int totalPurchases = 0;
        for (Purchase p : purchaseList) {
            totalPurchases += p.getQuantity();
            response.getPurchases().add(new NetMovementDetailResponse.MovementItem(
                    "PURCHASE",
                    p.getReferenceNumber(),
                    p.getBase().getName(),
                    null,
                    p.getBase().getName(),
                    p.getEquipmentType().getName(),
                    p.getQuantity(),
                    p.getPurchaseDate(),
                    p.getCreatedBy()
            ));
        }

        // 2. Fetch Transfers In
        List<Transfer> transferInList = transferRepository.findTransferInList(
                effectiveBaseId, equipmentTypeId, startDate, endDate);
        int totalTransferIn = 0;
        for (Transfer t : transferInList) {
            totalTransferIn += t.getQuantity();
            response.getTransfersIn().add(new NetMovementDetailResponse.MovementItem(
                    "TRANSFER_IN",
                    t.getReferenceNumber(),
                    t.getToBase().getName(),
                    t.getFromBase().getName(),
                    t.getToBase().getName(),
                    t.getEquipmentType().getName(),
                    t.getQuantity(),
                    t.getTransferDate(),
                    t.getCreatedBy()
            ));
        }

        // 3. Fetch Transfers Out
        List<Transfer> transferOutList = transferRepository.findTransferOutList(
                effectiveBaseId, equipmentTypeId, startDate, endDate);
        int totalTransferOut = 0;
        for (Transfer t : transferOutList) {
            totalTransferOut += t.getQuantity();
            response.getTransfersOut().add(new NetMovementDetailResponse.MovementItem(
                    "TRANSFER_OUT",
                    t.getReferenceNumber(),
                    t.getFromBase().getName(),
                    t.getFromBase().getName(),
                    t.getToBase().getName(),
                    t.getEquipmentType().getName(),
                    t.getQuantity(),
                    t.getTransferDate(),
                    t.getCreatedBy()
            ));
        }

        response.setTotalPurchases(totalPurchases);
        response.setTotalTransferIn(totalTransferIn);
        response.setTotalTransferOut(totalTransferOut);
        response.setNetMovement(totalPurchases + totalTransferIn - totalTransferOut);

        return response;
    }
}
