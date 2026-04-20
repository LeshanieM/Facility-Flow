package com.smartcampus;

import com.smartcampus.incident.service.IncidentService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class TestRunner {

    private final IncidentService incidentService;

    public TestRunner(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        System.out.println("====== TEST RUNNER START ======");
        try {
            var summary = incidentService.getStudentDashboardSummary("some-id");
            System.out.println("Summary: " + summary);
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("====== TEST RUNNER END ======");
    }
}
