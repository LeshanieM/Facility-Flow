package com.smartcampus.incident.controller;

import com.smartcampus.entity.User;
import com.smartcampus.incident.dto.IncidentRequests.UpdateStatusRequest;
import com.smartcampus.incident.dto.IncidentResponses.TicketResponse;
import com.smartcampus.incident.service.IncidentService;
import com.smartcampus.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin/tickets")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminIncidentController {

    private final IncidentService incidentService;
    private final UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(incidentService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateStatusRequest request,
            Principal principal) {
        
        User admin = getUser(principal);
        TicketResponse response = incidentService.updateStatus(id, request.getStatus(), admin);
        return ResponseEntity.ok(response);
    }

    private User getUser(Principal principal) {
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof User) {
                return (User) auth.getPrincipal();
            }
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
