package com.smartcampus.controller;

import com.smartcampus.entity.User;
import com.smartcampus.incident.service.IncidentService;
import com.smartcampus.incident.dto.IncidentResponses.DashboardSummaryResponse;
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
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class UserController {

    private final IncidentService incidentService;

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
