package com.smartcampus.incident.service;

import com.smartcampus.entity.User;
import com.smartcampus.incident.dto.IncidentRequests.*;
import com.smartcampus.incident.dto.IncidentRequests.CreateTicketRequest;
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
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            for (org.springframework.web.multipart.MultipartFile file : request.getAttachments()) {
                if (file != null && !file.isEmpty()) {
                    uploadedFiles.add(file.getOriginalFilename());
                }
            }
        }

        Incident incident = Incident.builder()
            .ticketId("INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .title(request.getTitle())
            .description(request.getDescription())
            .category(request.getCategory())
            .location(request.getLocation())
            .room(request.getRoom())
            .priority(mappedPriority)
            .status(IncidentStatus.SUBMITTED)
            .submittedBy(user)
            .attachments(uploadedFiles)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
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
            .filter(i -> i.getStatus() == IncidentStatus.SUBMITTED || i.getStatus() == IncidentStatus.UNDER_REVIEW)
            .count();
        long approved = incidents.stream()
            .filter(i -> i.getStatus() == IncidentStatus.ASSIGNED || i.getStatus() == IncidentStatus.IN_PROGRESS)
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
        if (incident.getStatus() != IncidentStatus.SUBMITTED && incident.getStatus() != IncidentStatus.UNDER_REVIEW) {
            throw new IllegalIncidentStateException("Incident cannot be cancelled in current status.");
        }
        incident.setStatus(IncidentStatus.CLOSED);
        incident.setUpdatedAt(Instant.now());
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
        if (newStatus == IncidentStatus.RESOLVED || newStatus == IncidentStatus.CLOSED) {
            incident.setResolvedAt(Instant.now());
            Instant startForResolution = incident.getCreatedAt() != null ? incident.getCreatedAt() : Instant.now();
            incident.setResolutionDurationMinutes(ChronoUnit.MINUTES.between(startForResolution, Instant.now()));
        }

        slaService.evaluateSlaBreach(incident);
        incident.setUpdatedAt(Instant.now());
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
        
        if (incident.getStatus() == IncidentStatus.SUBMITTED || incident.getStatus() == IncidentStatus.UNDER_REVIEW) {
            incident.setStatus(IncidentStatus.ASSIGNED);
        }
        
        incident.setUpdatedAt(Instant.now());

        Incident saved = incidentRepository.save(incident);
        logActivity(id, admin, assignmentAction, "Assigned technician: " + technician.getName());
        return toResponse(saved);
    }

    private Incident findById(String id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));
    }

    @Transactional
    public TicketResponse addComment(String incidentId, AddCommentRequest request, User user) {
        Incident incident = findById(incidentId);
        
        com.smartcampus.incident.model.IncidentComment comment = com.smartcampus.incident.model.IncidentComment.builder()
                .message(request.getMessage())
                .authorName(user.getName())
                .authorRole(user.getRole() != null ? user.getRole().name() : "USER")
                .timestamp(Instant.now())
                .visibleToRequester(request.isVisibleToRequester())
                .build();
                
        if (incident.getComments() == null) {
            incident.setComments(new ArrayList<>());
        }
        incident.getComments().add(comment);
        incident.setUpdatedAt(Instant.now());
        
        Incident saved = incidentRepository.save(incident);
        logActivity(incidentId, user, ActivityAction.COMMENT_ADDED, "Added comment: " + request.getMessage());
        return toResponse(saved);
    }
    
    public List<ActivityLogResponse> getActivityLogs(String incidentId) {
        return activityLogRepository.findByIncidentIdOrderByTimestampDesc(incidentId).stream()
            .map(log -> new ActivityLogResponse(
                log.getId(),
                log.getIncidentId(),
                log.getActionType() != null ? log.getActionType().name() : null,
                log.getMessage(),
                log.getPerformedBy() != null ? log.getPerformedBy().getName() : null,
                log.getPerformedByRole(),
                log.getTimestamp() != null ? log.getTimestamp().toString() : null
            ))
            .collect(Collectors.toList());
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

    private Instant getCreatedAtCorrected(Incident incident) {
        if (incident.getCreatedAt() != null) {
            return incident.getCreatedAt();
        }
        if (incident.getId() != null && org.bson.types.ObjectId.isValid(incident.getId())) {
            return new org.bson.types.ObjectId(incident.getId()).getDate().toInstant();
        }
        return null;
    }

    private TicketResponse toResponse(Incident incident) {
        slaService.evaluateSlaBreach(incident);
        Instant actualCreatedAt = getCreatedAtCorrected(incident);
        
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
            actualCreatedAt != null ? actualCreatedAt.toString() : null,
            incident.getUpdatedAt() != null ? incident.getUpdatedAt().toString() : null,
            incident.getComments()
        );
    }
}
