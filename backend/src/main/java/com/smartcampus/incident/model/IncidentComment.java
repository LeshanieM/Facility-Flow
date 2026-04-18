package com.smartcampus.incident.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentComment {
    private String message;
    private String authorName;
    private String authorRole;
    private Instant timestamp;
    private boolean visibleToRequester;
}
