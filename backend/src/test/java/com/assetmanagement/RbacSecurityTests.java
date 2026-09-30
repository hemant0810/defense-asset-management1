package com.assetmanagement;

import com.assetmanagement.dto.request.AssignmentRequest;
import com.assetmanagement.dto.request.LoginRequest;
import com.assetmanagement.dto.request.PurchaseRequest;
import com.assetmanagement.dto.response.JwtAuthResponse;
import com.assetmanagement.entity.Base;
import com.assetmanagement.entity.EquipmentType;
import com.assetmanagement.entity.Role;
import com.assetmanagement.entity.User;
import com.assetmanagement.exception.UnauthorizedException;
import com.assetmanagement.repository.BaseRepository;
import com.assetmanagement.repository.EquipmentTypeRepository;
import com.assetmanagement.repository.UserRepository;
import com.assetmanagement.security.CustomUserDetails;
import com.assetmanagement.service.AssignmentService;
import com.assetmanagement.service.AuthService;
import com.assetmanagement.service.PurchaseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RbacSecurityTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Base baseAlpha;
    private Base baseBravo;
    private EquipmentType equipment;

    @BeforeEach
    public void setup() {
        baseAlpha = baseRepository.save(new Base("FOB Alpha", "Sector A"));
        baseBravo = baseRepository.save(new Base("FOB Bravo", "Sector B"));
        equipment = equipmentTypeRepository.save(new EquipmentType("Radio Kit", "Communication Equipment", "Comm"));

        // Create test users
        userRepository.save(new User(
                "commander_test",
                passwordEncoder.encode("secretPass"),
                "Maj. Test Commander",
                "commander@test.com",
                Role.BASE_COMMANDER,
                baseAlpha
        ));

        userRepository.save(new User(
                "logistics_test",
                passwordEncoder.encode("secretPass"),
                "Capt. Test Logistics",
                "logistics@test.com",
                Role.LOGISTICS_OFFICER,
                baseAlpha
        ));
    }

    @Test
    @DisplayName("Login with valid credentials returns JWT token and user role")
    public void testSuccessfulLogin() {
        LoginRequest req = new LoginRequest("commander_test", "secretPass");
        JwtAuthResponse response = authService.login(req);

        assertNotNull(response.getAccessToken());
        assertEquals("commander_test", response.getUsername());
        assertEquals("BASE_COMMANDER", response.getRole());
        assertEquals(baseAlpha.getId(), response.getBaseId());
    }

    @Test
    @DisplayName("Login with invalid password throws BadCredentialsException")
    public void testFailedLogin() {
        LoginRequest req = new LoginRequest("commander_test", "wrongPassword");
        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    @DisplayName("Base Commander cannot create purchases")
    public void testBaseCommanderCannotPurchase() {
        CustomUserDetails commanderPrincipal = new CustomUserDetails(
                10L, "commander_test", "pass", "Commander", "cmd@test.com",
                Role.BASE_COMMANDER, baseAlpha.getId(), baseAlpha.getName(), Collections.emptyList()
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(commanderPrincipal, null, commanderPrincipal.getAuthorities())
        );

        PurchaseRequest req = new PurchaseRequest(
                baseAlpha.getId(), equipment.getId(), 5, LocalDate.now(), "UNAUTH-PO");

        assertThrows(UnauthorizedException.class, () -> purchaseService.createPurchase(req));
    }

    @Test
    @DisplayName("Logistics Officer cannot assign equipment to personnel")
    public void testLogisticsOfficerCannotAssign() {
        CustomUserDetails logisticsPrincipal = new CustomUserDetails(
                11L, "logistics_test", "pass", "Logistics", "log@test.com",
                Role.LOGISTICS_OFFICER, baseAlpha.getId(), baseAlpha.getName(), Collections.emptyList()
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(logisticsPrincipal, null, logisticsPrincipal.getAuthorities())
        );

        AssignmentRequest req = new AssignmentRequest(
                baseAlpha.getId(), equipment.getId(), "Trooper Alpha", 2, LocalDate.now());

        assertThrows(UnauthorizedException.class, () -> assignmentService.createAssignment(req));
    }

    @Test
    @DisplayName("Logistics Officer cannot purchase for a different base")
    public void testLogisticsOfficerBaseScoping() {
        CustomUserDetails logisticsPrincipal = new CustomUserDetails(
                11L, "logistics_test", "pass", "Logistics", "log@test.com",
                Role.LOGISTICS_OFFICER, baseAlpha.getId(), baseAlpha.getName(), Collections.emptyList()
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(logisticsPrincipal, null, logisticsPrincipal.getAuthorities())
        );

        // Attempting to purchase for baseBravo while assigned to baseAlpha
        PurchaseRequest req = new PurchaseRequest(
                baseBravo.getId(), equipment.getId(), 5, LocalDate.now(), "UNAUTH-BASE-PO");

        assertThrows(UnauthorizedException.class, () -> purchaseService.createPurchase(req));
    }
}
