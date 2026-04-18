package com.smartcampus.incident.dto;

import com.smartcampus.incident.enums.IncidentEnums.IncidentStatus;
import com.smartcampus.incident.enums.IncidentEnums.PriorityLevel;
import com.smartcampus.incident.enums.IncidentEnums.SlaStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import com.smartcampus.incident.model.IncidentComment;

public class IncidentResponses {

    @Data
    @AllArgsConstructor
    public static class TicketResponse {
        private String id;
        private String ticketId;
        private String title;
        private String description;
        private String category;
        private String location;
        private String room;
        private PriorityLevel priority;
        private IncidentStatus status;
        private String submittedByName;
        private String assignedTechnicianName;
        private List<String> attachments;
        private String rejectionReason;
        private String adminNotes;
        private String technicianNotes;
        private String resolutionSummary;
        private String slaResponseDeadline;
        private String slaResolutionDeadline;
        private SlaStatus slaStatus;
        private String createdAt;
        private String updatedAt;
        private List<IncidentComment> comments;
    }

    @Data
    @AllArgsConstructor
    public static class DashboardSummaryResponse {
        private long totalSubmitted;
        private long pending;
        private long approved;
        private long completed;
        private long rejected;
        private long overdue;
    }

    @Data
    @AllArgsConstructor
    public static class ActivityLogResponse {
        private String id;
        private String incidentId;
        private String actionType;
        private String message;
        private String performedByName;
        private String performedByRole;
        private String timestamp;
    }
}
