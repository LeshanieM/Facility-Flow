package com.smartcampus.incident.dto;

import com.smartcampus.incident.enums.IncidentEnums.IncidentStatus;
import com.smartcampus.incident.enums.IncidentEnums.PriorityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;


public class IncidentRequests {

    @Data
    public static class CreateTicketRequest {
        @NotBlank private String title;
        @NotBlank private String description;
        @NotBlank private String category;
        @NotBlank private String location;
        private String room;
        @NotBlank private String priority;
        private MultipartFile attachment;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull private IncidentStatus status;
    }

    @Data
    public static class AssignTechnicianRequest {
        @NotBlank private String technicianId;
    }

    @Data
    public static class UpdatePriorityRequest {
        @NotNull private PriorityLevel priority;
    }

    @Data
    public static class RejectTicketRequest {
        @NotBlank private String rejectionReason;
    }

    @Data
    public static class ResolutionRequest {
        @NotBlank private String resolutionSummary;
    }
    
    @Data
    public static class AddNoteRequest {
        @NotBlank private String note;
    }
}
