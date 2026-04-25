package com.smartcampus.facility.model;

import com.smartcampus.entity.User;
import com.smartcampus.facility.enums.FacilityEnums.ResourceStatus;
import com.smartcampus.facility.enums.FacilityEnums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;

    @Builder.Default
    private ResourceType type = ResourceType.LECTURE_HALL;

    private Integer capacity;
    
    private String location;
    
    private String description;

    @Builder.Default
    private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    private String imageUrl;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer numReviews = 0;

    @DocumentReference(lazy = true)
    private User createdBy;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
