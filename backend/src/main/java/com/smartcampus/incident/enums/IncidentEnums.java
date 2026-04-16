package com.smartcampus.incident.enums;

public class IncidentEnums {
    
    public enum PriorityLevel {
        LOW,
        MEDIUM,
        HIGH,
        EMERGENCY
    }

    public enum IncidentStatus {
        OPEN,
        PENDING_REVIEW,
        ASSIGNED,
        IN_PROGRESS,
        ON_HOLD,
        RESOLVED,
        CLOSED,
        REJECTED
    }

    public enum SlaStatus {
        ON_TIME,
        AT_RISK,
        BREACHED
    }

    public enum ActivityAction {
        CREATED,
        STATUS_CHANGED,
        PRIORITY_CHANGED,
        ASSIGNED,
        REASSIGNED,
        NOTE_ADDED,
        RESOLVED,
        CLOSED,
        REJECTED
    }
}
