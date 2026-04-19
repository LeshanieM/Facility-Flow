package com.smartcampus.facility.service;

import com.smartcampus.entity.User;
import com.smartcampus.facility.dto.FacilityRequests.CreateResourceRequest;
import com.smartcampus.facility.dto.FacilityRequests.UpdateResourceRequest;
import com.smartcampus.facility.dto.FacilityResponses.ResourceResponse;
import com.smartcampus.facility.enums.FacilityEnums.ResourceStatus;
import com.smartcampus.facility.enums.FacilityEnums.ResourceType;
import com.smartcampus.facility.exception.FacilityExceptions.ResourceNotFoundException;
import com.smartcampus.facility.model.Resource;
import com.smartcampus.facility.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceResponse createResource(CreateResourceRequest request, User admin) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .availabilityWindows(request.getAvailabilityWindows() != null ? request.getAvailabilityWindows() : List.of())
                .amenities(request.getAmenities() != null ? request.getAmenities() : List.of())
                .imageUrl(request.getImageUrl())
                .status(ResourceStatus.ACTIVE)
                .createdBy(admin)
                .build();

        return toResponse(resourceRepository.save(resource));
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> searchResources(ResourceType type, String location, Integer capacity) {
        return resourceRepository.searchResources(type, location, capacity).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ResourceResponse getResourceById(String id) {
        return toResponse(findById(id));
    }

    public ResourceResponse updateResource(String id, UpdateResourceRequest request) {
        Resource resource = findById(id);
        
        if (request.getName() != null) {
            resource.setName(request.getName());
        }
        if (request.getType() != null) {
            resource.setType(request.getType());
        }
        if (request.getCapacity() != null) {
            resource.setCapacity(request.getCapacity());
        }
        if (request.getLocation() != null) {
            resource.setLocation(request.getLocation());
        }
        if (request.getDescription() != null) {
            resource.setDescription(request.getDescription());
        }
        if (request.getAvailabilityWindows() != null) {
            resource.setAvailabilityWindows(request.getAvailabilityWindows());
        }
        if (request.getAmenities() != null) {
            resource.setAmenities(request.getAmenities());
        }
        if (request.getImageUrl() != null) {
            resource.setImageUrl(request.getImageUrl());
        }

        return toResponse(resourceRepository.save(resource));
    }

    public ResourceResponse updateStatus(String id, ResourceStatus newStatus) {
        Resource resource = findById(id);
        resource.setStatus(newStatus);
        return toResponse(resourceRepository.save(resource));
    }

    public void deleteResource(String id) {
        Resource resource = findById(id);
        resourceRepository.delete(resource);
    }

    private Resource findById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    private ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getDescription(),
                resource.getAvailabilityWindows(),
                resource.getAmenities(),
                resource.getImageUrl(),
                resource.getStatus(),
                resource.getCreatedBy() != null ? resource.getCreatedBy().getName() : null,
                resource.getCreatedAt() != null ? resource.getCreatedAt().toString() : null,
                resource.getUpdatedAt() != null ? resource.getUpdatedAt().toString() : null
        );
    }
}
