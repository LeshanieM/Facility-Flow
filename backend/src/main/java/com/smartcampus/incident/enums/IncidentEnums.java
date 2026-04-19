package com.smartcampus.incident.enums;

public class IncidentEnums {
    
    public enum PriorityLevel {
        LOW,
        MEDIUM,
        HIGH,
        EMERGENCY
    }

    public enum IncidentStatus {
        SUBMITTED,
        UNDER_REVIEW,
        ASSIGNED,
        IN_PROGRESS,
        ON_HOLD,
        RESOLVED,
        CLOSED,
        REJECTED
    }

    public enum SlaStatus {
        ON_TRACK,
        ON_TIME,
        RESPONSE_OVERDUE,
        RESOLUTION_OVERDUE,
        BREACHED,
        COMPLETED_WITHIN_SLA,
        COMPLETED_OVERDUE
    }

    public enum ActivityAction {
        CREATED,
        STATUS_CHANGED,
        PRIORITY_CHANGED,
        ASSIGNED,
        REASSIGNED,
        NOTE_ADDED,
        COMMENT_ADDED,
        COMMENT_EDITED,
        COMMENT_DELETED,
        RESOLVED,
        CLOSED,
        REJECTED
    }
}
