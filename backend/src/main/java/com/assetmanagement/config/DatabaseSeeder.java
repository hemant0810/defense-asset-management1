package com.assetmanagement.config;

import com.assetmanagement.entity.*;
import com.assetmanagement.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final BaseRepository baseRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final PurchaseRepository purchaseRepository;
    private final TransferRepository transferRepository;
    private final AssignmentRepository assignmentRepository;
    private final ExpenditureRepository expenditureRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(BaseRepository baseRepository,
                          EquipmentTypeRepository equipmentTypeRepository,
                          UserRepository userRepository,
                          AssetRepository assetRepository,
                          PurchaseRepository purchaseRepository,
                          TransferRepository transferRepository,
                          AssignmentRepository assignmentRepository,
                          ExpenditureRepository expenditureRepository,
                          AuditLogRepository auditLogRepository,
                          PasswordEncoder passwordEncoder) {
        this.baseRepository = baseRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.purchaseRepository = purchaseRepository;
        this.transferRepository = transferRepository;
        this.assignmentRepository = assignmentRepository;
        this.expenditureRepository = expenditureRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (baseRepository.count() > 0 && userRepository.count() > 0) {
            logger.info("Database already contains data. Skipping initial seeding.");
            return;
        }

        logger.info("Seeding initial operational data for Asset Management System...");

        // 1. Seed 3 Bases
        Base baseAlpha = baseRepository.save(new Base("Forward Operating Base Alpha", "Kandahar Sector"));
        Base baseCoronado = baseRepository.save(new Base("Naval Base Coronado", "San Diego, CA"));
        Base baseNellis = baseRepository.save(new Base("Air Force Base Nellis", "Nevada Range"));

        // 2. Seed 5 Equipment Types
        EquipmentType eqDrone = equipmentTypeRepository.save(new EquipmentType(
                "Tactical Drone MQ-9", "Vehicle", "Long-endurance surveillance and tactical reconnaissance drone"));
        EquipmentType eqNvg = equipmentTypeRepository.save(new EquipmentType(
                "Night Vision Goggles PVS-31", "Protective Equipment", "Dual-tube high-definition night vision system"));
        EquipmentType eqRadio = equipmentTypeRepository.save(new EquipmentType(
                "Satellite Comm Radio PRC-117G", "Communication Equipment", "Tactical multichannel wideband satellite communication radio"));
        EquipmentType eqJltv = equipmentTypeRepository.save(new EquipmentType(
                "Armored Transport Vehicle JLTV", "Vehicle", "Joint light tactical armored utility vehicle"));
        EquipmentType eqArmor = equipmentTypeRepository.save(new EquipmentType(
                "Ballistic Body Armor Gen-IV", "Protective Equipment", "Full tactical level-IV ballistic vest with plate carrier"));

        // 3. Seed Users
        // Admin
        User admin = userRepository.save(new User(
                "admin",
                passwordEncoder.encode("admin123"),
                "Col. John Miller",
                "admin@assetops.mil",
                Role.ADMIN,
                null
        ));

        // Base Commander (Assigned to Base Alpha)
        User commander = userRepository.save(new User(
                "commander_alpha",
                passwordEncoder.encode("commander123"),
                "Maj. Sarah Jenkins",
                "jenkins@assetops.mil",
                Role.BASE_COMMANDER,
                baseAlpha
        ));

        // Logistics Officer (Assigned to Base Alpha)
        User logistics = userRepository.save(new User(
                "logistics_officer",
                passwordEncoder.encode("logistics123"),
                "Capt. Michael Davis",
                "davis@assetops.mil",
                Role.LOGISTICS_OFFICER,
                baseAlpha
        ));

        // 4. Seed Initial Assets Stock
        // Base Alpha
        Asset alphaDrone = assetRepository.save(new Asset(eqDrone, baseAlpha, 15, "OPERATIONAL")); // 20 purchased - 5 transferred = 15
        Asset alphaNvg = assetRepository.save(new Asset(eqNvg, baseAlpha, 45, "OPERATIONAL"));    // 50 purchased - 4 assigned - 1 expended = 45
        Asset alphaRadio = assetRepository.save(new Asset(eqRadio, baseAlpha, 30, "OPERATIONAL"));
        Asset alphaJltv = assetRepository.save(new Asset(eqJltv, baseAlpha, 10, "OPERATIONAL"));
        Asset alphaArmor = assetRepository.save(new Asset(eqArmor, baseAlpha, 80, "OPERATIONAL"));

        // Base Coronado
        Asset coroDrone = assetRepository.save(new Asset(eqDrone, baseCoronado, 20, "OPERATIONAL")); // 15 purchased + 5 transferred in = 20
        Asset coroNvg = assetRepository.save(new Asset(eqNvg, baseCoronado, 30, "OPERATIONAL"));   // 40 purchased - 10 transferred = 30
        Asset coroRadio = assetRepository.save(new Asset(eqRadio, baseCoronado, 25, "OPERATIONAL"));
        Asset coroJltv = assetRepository.save(new Asset(eqJltv, baseCoronado, 8, "OPERATIONAL"));
        Asset coroArmor = assetRepository.save(new Asset(eqArmor, baseCoronado, 58, "OPERATIONAL")); // 60 purchased - 2 expended = 58

        // Base Nellis
        Asset nellDrone = assetRepository.save(new Asset(eqDrone, baseNellis, 10, "OPERATIONAL"));
        Asset nellNvg = assetRepository.save(new Asset(eqNvg, baseNellis, 40, "OPERATIONAL"));     // 30 purchased + 10 transferred in = 40
        Asset nellRadio = assetRepository.save(new Asset(eqRadio, baseNellis, 20, "OPERATIONAL"));
        Asset nellJltv = assetRepository.save(new Asset(eqJltv, baseNellis, 5, "OPERATIONAL"));
        Asset nellArmor = assetRepository.save(new Asset(eqArmor, baseNellis, 50, "OPERATIONAL"));

        // 5. Seed Purchases
        LocalDate now = LocalDate.now();
        purchaseRepository.save(new Purchase(baseAlpha, eqDrone, 20, now.minusDays(15), "PO-ALPHA-2026-001", "Capt. Michael Davis"));
        purchaseRepository.save(new Purchase(baseAlpha, eqNvg, 50, now.minusDays(14), "PO-ALPHA-2026-002", "Capt. Michael Davis"));
        purchaseRepository.save(new Purchase(baseAlpha, eqRadio, 30, now.minusDays(12), "PO-ALPHA-2026-003", "Capt. Michael Davis"));
        purchaseRepository.save(new Purchase(baseAlpha, eqJltv, 10, now.minusDays(10), "PO-ALPHA-2026-004", "Capt. Michael Davis"));
        purchaseRepository.save(new Purchase(baseAlpha, eqArmor, 80, now.minusDays(8), "PO-ALPHA-2026-005", "Capt. Michael Davis"));

        purchaseRepository.save(new Purchase(baseCoronado, eqDrone, 15, now.minusDays(15), "PO-CORO-2026-001", "Capt. Michael Davis"));
        purchaseRepository.save(new Purchase(baseCoronado, eqNvg, 40, now.minusDays(13), "PO-CORO-2026-002", "Capt. Michael Davis"));
        purchaseRepository.save(new Purchase(baseCoronado, eqRadio, 25, now.minusDays(11), "PO-CORO-2026-003", "Capt. Michael Davis"));
        purchaseRepository.save(new Purchase(baseCoronado, eqJltv, 8, now.minusDays(9), "PO-CORO-2026-004", "Capt. Michael Davis"));
        purchaseRepository.save(new Purchase(baseCoronado, eqArmor, 60, now.minusDays(7), "PO-CORO-2026-005", "Capt. Michael Davis"));

        purchaseRepository.save(new Purchase(baseNellis, eqDrone, 10, now.minusDays(14), "PO-NELL-2026-001", "Col. John Miller"));
        purchaseRepository.save(new Purchase(baseNellis, eqNvg, 30, now.minusDays(12), "PO-NELL-2026-002", "Col. John Miller"));
        purchaseRepository.save(new Purchase(baseNellis, eqRadio, 20, now.minusDays(10), "PO-NELL-2026-003", "Col. John Miller"));
        purchaseRepository.save(new Purchase(baseNellis, eqJltv, 5, now.minusDays(8), "PO-NELL-2026-004", "Col. John Miller"));
        purchaseRepository.save(new Purchase(baseNellis, eqArmor, 50, now.minusDays(6), "PO-NELL-2026-005", "Col. John Miller"));

        // 6. Seed Transfers
        transferRepository.save(new Transfer(baseAlpha, baseCoronado, eqDrone, 5, now.minusDays(5),
                "TR-2026-001", "COMPLETED", "Capt. Michael Davis"));
        transferRepository.save(new Transfer(baseCoronado, baseNellis, eqNvg, 10, now.minusDays(3),
                "TR-2026-002", "COMPLETED", "Col. John Miller"));

        // 7. Seed Assignments
        assignmentRepository.save(new Assignment(baseAlpha, eqNvg, "Sgt. Robert Vance", 4, now.minusDays(4), "Maj. Sarah Jenkins"));
        assignmentRepository.save(new Assignment(baseAlpha, eqDrone, "Lt. Emily Clark", 2, now.minusDays(2), "Maj. Sarah Jenkins"));

        // 8. Seed Expenditures
        expenditureRepository.save(new Expenditure(baseAlpha, eqNvg, 1, now.minusDays(2),
                "Damaged during night perimeter patrol reconnaissance", "Maj. Sarah Jenkins"));
        expenditureRepository.save(new Expenditure(baseCoronado, eqArmor, 2, now.minusDays(1),
                "Compromised during live-fire training exercise", "Col. John Miller"));

        // 9. Seed Audit Logs
        auditLogRepository.save(new AuditLog(admin.getId(), "admin", "SYSTEM_INIT", "SYSTEM", 0L,
                "Initial operational bases and equipment catalog loaded into system", "127.0.0.1"));
        auditLogRepository.save(new AuditLog(logistics.getId(), "logistics_officer", "PURCHASE_CREATED", "PURCHASE", 1L,
                "Created initial purchase order PO-ALPHA-2026-001 for 20 Tactical Drones", "127.0.0.1"));
        auditLogRepository.save(new AuditLog(logistics.getId(), "logistics_officer", "TRANSFER_COMPLETED", "TRANSFER", 1L,
                "Executed transfer TR-2026-001: 5 Tactical Drones from Base Alpha to Base Coronado", "127.0.0.1"));
        auditLogRepository.save(new AuditLog(commander.getId(), "commander_alpha", "ASSIGNMENT_CREATED", "ASSIGNMENT", 1L,
                "Assigned 4 Night Vision Goggles to Sgt. Robert Vance at Base Alpha", "127.0.0.1"));
        auditLogRepository.save(new AuditLog(commander.getId(), "commander_alpha", "EXPENDITURE_RECORDED", "EXPENDITURE", 1L,
                "Recorded expenditure of 1 Night Vision Goggle due to patrol damage", "127.0.0.1"));

        logger.info("Database seeding completed successfully. Sample credentials: admin/admin123, commander_alpha/commander123, logistics_officer/logistics123");
    }
}
