package com.smartcampus.incident.service;

import com.smartcampus.entity.User;
import com.smartcampus.incident.dto.IncidentRequests.*;
import com.smartcampus.incident.dto.IncidentResponses.*;
import com.smartcampus.incident.enums.IncidentEnums.*;
import com.smartcampus.incident.exception.IncidentExceptions.*;
import com.smartcampus.incident.model.Incident;
import com.smartcampus.incident.model.IncidentActivityLog;
import com.smartcampus.incident.repository.IncidentActivityLogRepository;
import com.smartcampus.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentActivityLogRepository activityLogRepository;
    private final SlaService slaService;
    private final com.smartcampus.repository.UserRepository userRepository;

    @Transactional
    public TicketResponse createIncident(CreateTicketRequest request, User user) {
        PriorityLevel mappedPriority = PriorityLevel.MEDIUM;
        try {
            mappedPriority = PriorityLevel.valueOf(request.getPriority().toUpperCase());
        } catch (IllegalArgumentException e) {
            mappedPriority = PriorityLevel.MEDIUM;
        }

        List<String> uploadedFiles = new ArrayList<>();
        if (request.getAttachment() != null && !request.getAttachment().isEmpty()) {
            uploadedFiles.add(request.getAttachment().getOriginalFilename());
        }

        Incident incident = Incident.builder()
            .ticketId("INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .title(request.getTitle())
            .description(request.getDescription())
            .category(request.getCategory())
            .location(request.getLocation())
            .room(request.getRoom())
            .priority(mappedPriority)
            .status(IncidentStatus.OPEN)
            .submittedBy(user)
            .attachments(uploadedFiles)
            .build();

        slaService.calculateDeadlines(incident);
        Incident saved = incidentRepository.save(incident);

        logActivity(saved.getId(), user, ActivityAction.CREATED, "Incident created.");
        
        return toResponse(saved);
    }

    public List<TicketResponse> getUserTickets(String userId) {
        return incidentRepository.findBySubmittedById(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getAllTickets() {
        return incidentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getTechnicianTickets(String technicianId) {
        return incidentRepository.findByAssignedTechnicianId(technicianId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse getTicketById(String id) {
        return toResponse(findById(id));
    }

    public DashboardSummaryResponse getStudentDashboardSummary(String userId) {
        List<Incident> incidents = incidentRepository.findBySubmittedById(userId);
        long totalSubmitted = incidents.size();
        long pending = incidents.stream()
            .filter(i -> i.getStatus() == IncidentStatus.OPEN || i.getStatus() == IncidentStatus.IN_PROGRESS || i.getStatus() == IncidentStatus.PENDING_REVIEW)
            .count();
        long approved = incidents.stream()
            .filter(i -> i.getStatus() == IncidentStatus.IN_PROGRESS || i.getStatus() == IncidentStatus.RESOLVED)
            .count();
        long completed = incidents.stream()
            .filter(i -> i.getStatus() == IncidentStatus.RESOLVED || i.getStatus() == IncidentStatus.CLOSED)
            .count();
        long rejected = incidents.stream().filter(i -> i.getStatus() == IncidentStatus.REJECTED).count();
        long overdue = incidents.stream().filter(i -> i.getSlaStatus() == SlaStatus.BREACHED).count();
        
        return new DashboardSummaryResponse(totalSubmitted, pending, approved, completed, rejected, overdue);
    }

    @Transactional
    public void cancelIncident(String id, User user) {
        Incident incident = findById(id);
        if (!incident.getSubmittedBy().getId().equals(user.getId())) {
            throw new UnauthorizedIncidentAccessException("Cannot cancel another user's incident.");
        }
        if (incident.getStatus() != IncidentStatus.OPEN && incident.getStatus() != IncidentStatus.PENDING_REVIEW) {
            throw new IllegalIncidentStateException("Incident cannot be cancelled in current status.");
        }
        incident.setStatus(IncidentStatus.CLOSED);
        incidentRepository.save(incident);
        logActivity(id, user, ActivityAction.CLOSED, "User cancelled the incident.");
    }

    @Transactional
    public TicketResponse updateStatus(String id, IncidentStatus newStatus, User user) {
        Incident incident = findById(id);
        incident.setStatus(newStatus);
        
        if (newStatus == IncidentStatus.IN_PROGRESS && incident.getFirstResponseAt() == null) {
            incident.setFirstResponseAt(Instant.now());
            Instant startForResponse = incident.getCreatedAt() != null ? incident.getCreatedAt() : Instant.now();
            incident.setResponseDurationMinutes(ChronoUnit.MINUTES.between(startForResponse, Instant.now()));
        }
        if (newStatus == IncidentStatus.RESOLVED || newStatus == IncidentStatus.COMPLETED) {
            incident.setResolvedAt(Instant.now());
            Instant startForResolution = incident.getCreatedAt() != null ? incident.getCreatedAt() : Instant.now();
            incident.setResolutionDurationMinutes(ChronoUnit.MINUTES.between(startForResolution, Instant.now()));
        }

        slaService.evaluateSlaBreach(incident);
        Incident saved = incidentRepository.save(incident);
        logActivity(id, user, ActivityAction.STATUS_CHANGED, "Status changed to " + newStatus);
        return toResponse(saved);
    }

    @Transactional
    public TicketResponse assignTechnician(String id, String technicianId, User admin) {
        Incident incident = findById(id);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician user not found"));

        ActivityAction assignmentAction =
                incident.getAssignedTechnician() == null ? ActivityAction.ASSIGNED : ActivityAction.REASSIGNED;
        incident.setAssignedTechnician(technician);

        // Status updates upon assigning depending on logic
        // As requested: It stays OPEN, or if it was PENDING_REVIEW it remains so.
        // It becomes IN_PROGRESS once technician views/accepts it. Wait, the user said
        // "it should be in_progress after the technician view and accept it". So we do NOT change status here.

        Incident saved = incidentRepository.save(incident);
        logActivity(id, admin, assignmentAction, "Assigned technician: " + technician.getName());
        return toResponse(saved);
    }

    private Incident findById(String id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));
    }

    public void logActivity(String incidentId, User user, ActivityAction action, String message) {
        IncidentActivityLog log = IncidentActivityLog.builder()
            .incidentId(incidentId)
            .actionType(action)
            .message(message)
            .performedBy(user)
            .performedByRole(user.getRole() != null ? user.getRole().name() : "USER")
            .timestamp(Instant.now())
            .build();
        activityLogRepository.save(log);
    }

    private TicketResponse toResponse(Incident incident) {
        slaService.evaluateSlaBreach(incident);
        return new TicketResponse(
            incident.getId(),
            incident.getTicketId(),
            incident.getTitle(),
            incident.getDescription(),
            incident.getCategory(),
            incident.getLocation(),
            incident.getRoom(),
            incident.getPriority(),
            incident.getStatus(),
            incident.getSubmittedBy() != null ? incident.getSubmittedBy().getName() : null,
            incident.getAssignedTechnician() != null ? incident.getAssignedTechnician().getName() : null,
            incident.getAttachments(),
            incident.getRejectionReason(),
            incident.getAdminNotes(),
            incident.getTechnicianNotes(),
            incident.getResolutionSummary(),
            incident.getSlaResponseDeadline() != null ? incident.getSlaResponseDeadline().toString() : null,
            incident.getSlaResolutionDeadline() != null ? incident.getSlaResolutionDeadline().toString() : null,
            incident.getSlaStatus(),
            incident.getCreatedAt() != null ? incident.getCreatedAt().toString() : Instant.now().toString(),
            incident.getUpdatedAt() != null ? incident.getUpdatedAt().toString() : Instant.now().toString()
        );
    }
}
