package com.smartcampus.facility.controller;

import com.smartcampus.facility.dto.FacilityResponses.ResourceResponse;
import com.smartcampus.facility.enums.FacilityEnums.ResourceStatus;
import com.smartcampus.facility.enums.FacilityEnums.ResourceType;
import com.smartcampus.facility.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN')")
@RequiredArgsConstructor
public class UserResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {
        
        if (type != null || location != null || minCapacity != null) {
            return ResponseEntity.ok(resourceService.searchResources(type, location, minCapacity));
        }
        return ResponseEntity.ok(resourceService.getResourcesByStatus(ResourceStatus.ACTIVE));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponse>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {
        return ResponseEntity.ok(resourceService.searchResources(type, location, minCapacity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }
}
