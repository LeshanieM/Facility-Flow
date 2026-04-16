package com.smartcampus.incident.service;

import com.smartcampus.incident.enums.IncidentEnums.PriorityLevel;
import com.smartcampus.incident.enums.IncidentEnums.SlaStatus;
import com.smartcampus.incident.model.Incident;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class SlaService {

    public void calculateDeadlines(Incident incident) {
        Instant now = Instant.now();
        PriorityLevel priority = incident.getPriority();
        
        long responseMinutes;
        long resolutionHours;
        
        switch (priority) {
            case EMERGENCY:
                responseMinutes = 15; 
                resolutionHours = 4;
                break;
            case HIGH:
                responseMinutes = 60; 
                resolutionHours = 8;
                break;
            case LOW:
                responseMinutes = 480; 
                resolutionHours = 72;
                break;
            case MEDIUM:
            default:
                responseMinutes = 240; 
                resolutionHours = 24;
                break;
        }

        incident.setSlaResponseDeadline(now.plus(responseMinutes, ChronoUnit.MINUTES));
        incident.setSlaResolutionDeadline(now.plus(resolutionHours, ChronoUnit.HOURS));
        incident.setSlaStatus(SlaStatus.ON_TIME);
    }

    public void evaluateSlaBreach(Incident incident) {
        Instant now = Instant.now();
        
        if (incident.getResolvedAt() == null && incident.getSlaResolutionDeadline() != null) {
            if (now.isAfter(incident.getSlaResolutionDeadline())) {
                incident.setSlaStatus(SlaStatus.BREACHED);
            } else if (now.plus(1, ChronoUnit.HOURS).isAfter(incident.getSlaResolutionDeadline())) {
                incident.setSlaStatus(SlaStatus.AT_RISK);
            }
        }
    }
}
