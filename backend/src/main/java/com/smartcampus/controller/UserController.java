package com.smartcampus.controller;

import com.smartcampus.entity.User;
import com.smartcampus.incident.service.IncidentService;
import com.smartcampus.incident.dto.IncidentResponses.DashboardSummaryResponse;
import com.smartcampus.service.UserService;
import com.smartcampus.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class UserController {

    private final IncidentService incidentService;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final com.smartcampus.repository.UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof User u) {
                // Fetch fresh from DB to ensure latest data (picture, name etc.)
                return ResponseEntity.ok(userRepository.findById(u.getId())
                        .orElseThrow(() -> new RuntimeException("User not found")));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "picture", required = false) org.springframework.web.multipart.MultipartFile picture,
            Principal principal) throws java.io.IOException {
        
        String userId = "";
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof User u) {
                userId = u.getId();
            }
        }

        String pictureUrl = null;
        if (picture != null && !picture.isEmpty()) {
            pictureUrl = cloudinaryService.uploadImage(picture);
        }

        return ResponseEntity.ok(userService.updateProfile(userId, name, pictureUrl));
    }

    @PostMapping("/bookings")
    public ResponseEntity<Map<String, String>> createBooking(@RequestBody Map<String, Object> bookingDetails) {
        // Implementation for university facility booking
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Booking created successfully", "status", "CONFIRMED"));
    }

    @GetMapping("/dashboard-summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(Principal principal) {
        String userId = "";
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof User u) {
                userId = u.getId();
            }
        }
        return ResponseEntity.ok(incidentService.getStudentDashboardSummary(userId));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Object>> getNotifications() {
        return ResponseEntity.ok(List.of());
    }
}
