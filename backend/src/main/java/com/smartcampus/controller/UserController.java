package com.smartcampus.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
public class UserController {

    @PostMapping("/bookings")
    public ResponseEntity<Map<String, String>> createBooking(@RequestBody Map<String, Object> bookingDetails) {
        // Implementation for university facility booking
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Booking created successfully", "status", "CONFIRMED"));
    }
}
