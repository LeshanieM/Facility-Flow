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
@RequestMapping("/api/technician/tickets")
@PreAuthorize("hasRole('SUPPORT') or hasRole('TECHNICIAN')")
@RequiredArgsConstructor
public class TechnicianIncidentController {

    private final IncidentService incidentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<java.util.List<TicketResponse>> getAssignedTickets(Principal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(incidentService.getTechnicianTickets(user.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateStatusRequest request,
            Principal principal) {
        
        User user = getUser(principal);
        TicketResponse response = incidentService.updateStatus(id, request.getStatus(), user);
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
