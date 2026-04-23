package com.smartcampus.notification.controller;

import com.smartcampus.notification.model.NotificationPreference;
import com.smartcampus.notification.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService service;

    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationPreference>> getPreferences(@PathVariable String userId) {
        return ResponseEntity.ok(service.getPreferences(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<NotificationPreference> updatePreference(
            @PathVariable String userId,
            @RequestParam String category,
            @RequestParam boolean emailEnabled,
            @RequestParam boolean inAppEnabled) {
        return ResponseEntity.ok(service.updatePreference(userId, category, emailEnabled, inAppEnabled));
    }
}
