package com.smartcampus.controller;

import com.smartcampus.entity.User;
import com.smartcampus.incident.service.IncidentService;
import com.smartcampus.incident.dto.IncidentResponses.DashboardSummaryResponse;
import com.smartcampus.service.UserService;
import com.smartcampus.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(value = "/api/user", produces = { MediaTypes.HAL_JSON_VALUE, MediaType.APPLICATION_JSON_VALUE })
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class UserController {

    private final IncidentService incidentService;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final com.smartcampus.repository.UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<EntityModel<User>> getCurrentUser(Principal principal) {
        // Java 11 compatible instanceof
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
            if (auth.getPrincipal() instanceof User) {
                User u = (User) auth.getPrincipal();
                // Fetch fresh from DB to ensure latest data (picture, name etc.)
                User freshUser = userRepository.findById(u.getId())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                EntityModel<User> model = EntityModel.of(freshUser)
                        .add(linkTo(methodOn(UserController.class).getCurrentUser(principal)).withSelfRel())
                        .add(linkTo(methodOn(UserController.class).updateProfile(null, null, principal)).withRel("updateProfile"))
                        .add(linkTo(methodOn(UserController.class).getDashboardSummary(principal)).withRel("dashboardSummary"))
                        .add(linkTo(methodOn(UserController.class).getNotifications()).withRel("notifications"))
                        .add(linkTo(methodOn(UserController.class).createBooking(null)).withRel("createBooking"));

                return ResponseEntity.ok(model);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/profile")
    public ResponseEntity<EntityModel<User>> updateProfile(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "picture", required = false) MultipartFile picture,
            Principal principal) {
        
        String userId = "";
        // Java 11 compatible instanceof
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
            if (auth.getPrincipal() instanceof User) {
                User u = (User) auth.getPrincipal();
                userId = u.getId();
            }
        }

        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String pictureUrl = null;
        if (picture != null && !picture.isEmpty()) {
            try {
                pictureUrl = cloudinaryService.uploadImage(picture);
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
            }
        }

        User updated = userService.updateProfile(userId, name, pictureUrl);
        EntityModel<User> model = EntityModel.of(updated)
                .add(linkTo(methodOn(UserController.class).getCurrentUser(principal)).withRel("me"))
                .add(linkTo(methodOn(UserController.class).updateProfile(null, null, principal)).withSelfRel());

        return ResponseEntity.ok(model);
    }

    @PostMapping("/bookings")
    public ResponseEntity<EntityModel<Map<String, String>>> createBooking(@RequestBody Map<String, Object> bookingDetails) {
        // Implementation for university facility booking
        String bookingId = UUID.randomUUID().toString();

        Map<String, String> payload = Map.of(
                "message", "Booking created successfully",
                "status", "CONFIRMED",
                "bookingId", bookingId
        );

        String location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(bookingId)
                .toUriString();

        EntityModel<Map<String, String>> model = EntityModel.of(payload)
                .add(Link.of(location).withSelfRel())
                .add(linkTo(methodOn(UserController.class).createBooking(null)).withRel("collection"))
                .add(linkTo(methodOn(UserController.class).getCurrentUser(null)).withRel("me"));

        return ResponseEntity.created(java.net.URI.create(location)).body(model);
    }

    @GetMapping("/dashboard-summary")
    public ResponseEntity<EntityModel<DashboardSummaryResponse>> getDashboardSummary(Principal principal) {
        String userId = "";
        // Java 11 compatible instanceof
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
            if (auth.getPrincipal() instanceof User) {
                User u = (User) auth.getPrincipal();
                userId = u.getId();
            }
        }

        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        DashboardSummaryResponse summary = incidentService.getStudentDashboardSummary(userId);
        EntityModel<DashboardSummaryResponse> model = EntityModel.of(summary)
                .add(linkTo(methodOn(UserController.class).getDashboardSummary(principal)).withSelfRel())
                .add(linkTo(methodOn(UserController.class).getCurrentUser(principal)).withRel("me"));

        return ResponseEntity.ok(model);
    }

    @GetMapping("/notifications")
    public ResponseEntity<CollectionModel<Object>> getNotifications() {
        List<Object> notifications = List.of();
        CollectionModel<Object> model = CollectionModel.of(notifications)
                .add(linkTo(methodOn(UserController.class).getNotifications()).withSelfRel())
                .add(linkTo(methodOn(UserController.class).getCurrentUser(null)).withRel("me"));
        
        return ResponseEntity.ok(model);
    }
}
