package com.smartcampus.incident.controller;

import com.smartcampus.entity.User;
import com.smartcampus.incident.dto.IncidentRequests.CreateTicketRequest;
import com.smartcampus.incident.dto.IncidentResponses.TicketResponse;
import com.smartcampus.incident.service.IncidentService;
import com.smartcampus.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class StudentIncidentController {

    private final IncidentService incidentService;
    private final UserRepository userRepository;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketResponse> createIncident(
            @Valid @ModelAttribute CreateTicketRequest request,
            Principal principal) {
        
        User user = getUser(principal);
        TicketResponse response = incidentService.createIncident(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(Principal principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(incidentService.getUserTickets(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketDetails(@PathVariable String id, Principal principal) {
        return ResponseEntity.ok(incidentService.getTicketById(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelTicket(@PathVariable String id, Principal principal) {
        User user = getUser(principal);
        incidentService.cancelIncident(id, user);
        return ResponseEntity.noContent().build();
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
