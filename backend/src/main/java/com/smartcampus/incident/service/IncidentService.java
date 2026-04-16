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
            incident.setResponseDurationMinutes(ChronoUnit.MINUTES.between(incident.getCreatedAt(), Instant.now()));
        }
        if (newStatus == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(Instant.now());
            incident.setResolutionDurationMinutes(ChronoUnit.MINUTES.between(incident.getCreatedAt(), Instant.now()));
        }

        slaService.evaluateSlaBreach(incident);
        Incident saved = incidentRepository.save(incident);
        logActivity(id, user, ActivityAction.STATUS_CHANGED, "Status changed to " + newStatus);
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
            incident.getSlaResponseDeadline(),
            incident.getSlaResolutionDeadline(),
            incident.getSlaStatus(),
            incident.getCreatedAt(),
            incident.getUpdatedAt()
        );
    }
}
