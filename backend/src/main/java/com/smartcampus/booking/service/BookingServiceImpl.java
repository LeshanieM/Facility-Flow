package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingResponseDTO;
import com.smartcampus.booking.dto.BookingSuggestionResponseDTO;
import com.smartcampus.booking.dto.SuggestedResourceDTO;
import com.smartcampus.booking.dto.RejectRequestDTO;
import com.smartcampus.booking.enums.BookingStatus;
import com.smartcampus.booking.exception.BookingConflictException;
import com.smartcampus.booking.exception.BookingNotFoundException;
import com.smartcampus.booking.mapper.BookingMapper;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.facility.enums.FacilityEnums.ResourceStatus;
import com.smartcampus.facility.exception.FacilityExceptions.ResourceNotFoundException;
import com.smartcampus.facility.model.Resource;
import com.smartcampus.facility.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final BookingMapper bookingMapper;
    private final MongoTemplate mongoTemplate;

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO, String currentUserEmail) {
        if (requestDTO.getEndTime().isBefore(requestDTO.getStartTime()) || requestDTO.getEndTime().equals(requestDTO.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Resource resource = resourceRepository.findById(requestDTO.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + requestDTO.getResourceId()));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                requestDTO.getResourceId(),
                requestDTO.getDate(),
                requestDTO.getStartTime(),
                requestDTO.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            BookingSuggestionResponseDTO suggestions = findAlternativeSuggestions(
                    requestDTO.getResourceId(),
                    requestDTO.getDate(),
                    requestDTO.getStartTime(),
                    requestDTO.getEndTime(),
                    requestDTO.getExpectedAttendees()
            );
            throw new BookingConflictException("Resource is already booked for the selected time slot.", suggestions);
        }

        Booking booking = Booking.builder()
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .resourceType(resource.getType() != null ? resource.getType().name() : null)
                .resourceLocation(resource.getLocation())
                .date(requestDTO.getDate())
                .startTime(requestDTO.getStartTime())
                .endTime(requestDTO.getEndTime())
                .purpose(requestDTO.getPurpose())
                .expectedAttendees(requestDTO.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .createdBy(currentUserEmail)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toDto(savedBooking);
    }

    @Override
    public List<BookingResponseDTO> getMyBookings(String currentUserEmail) {
        return bookingRepository.findByCreatedBy(currentUserEmail)
                .stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getAllBookings(String status, String resourceName, String dateStr) {
        Query query = new Query();
        if (status != null && !status.trim().isEmpty()) {
            query.addCriteria(Criteria.where("status").is(status.toUpperCase()));
        }
        if (resourceName != null && !resourceName.trim().isEmpty()) {
            query.addCriteria(Criteria.where("resourceName").regex(".*" + resourceName + ".*", "i"));
        }
        if (dateStr != null && !dateStr.trim().isEmpty()) {
            query.addCriteria(Criteria.where("date").is(LocalDate.parse(dateStr)));
        }
        
        List<Booking> bookings = mongoTemplate.find(query, Booking.class);
        return bookings.stream().map(bookingMapper::toDto).collect(Collectors.toList());
    }

    @Override
    public BookingResponseDTO getBookingById(String id, String currentUserEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (!isAdmin && !booking.getCreatedBy().equals(currentUserEmail)) {
            throw new AccessDeniedException("You do not have permission to view this booking");
        }
        return bookingMapper.toDto(booking);
    }

    @Override
    public BookingResponseDTO approveBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));
        
        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    @Override
    public BookingResponseDTO rejectBooking(String id, RejectRequestDTO requestDTO) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(requestDTO.getReason());
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    /**
     * Cancels an existing booking. Only the creator can cancel their own bookings.
     * Can only cancel APPROVED or PENDING bookings.
     */
    @Override
    public BookingResponseDTO cancelBooking(String id, String currentUserEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found"));

        if (!booking.getCreatedBy().equals(currentUserEmail)) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only APPROVED or PENDING bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingMapper.toDto(bookingRepository.save(booking));
    }

    /**
     * Smart Conflict Suggester: Finds alternative resources when the requested one is occupied.
     * 1. Filters resources by type, active status, and capacity.
     * 2. Checks availability for the requested time slot using Criteria API.
     * 3. Returns top 3 suggestions sorted by capacity proximity.
     */
    @Override
    public BookingSuggestionResponseDTO findAlternativeSuggestions(
            String resourceId, LocalDate date, java.time.LocalTime startTime, java.time.LocalTime endTime, Integer expectedAttendees) {
        
        // 1. Get the requested resource to determine the required type
        Resource requestedResource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + resourceId));

        // 2. Find candidate resources: same type, ACTIVE, sufficient capacity, and excluding the conflicting one
        Query resourceQuery = new Query();
        resourceQuery.addCriteria(Criteria.where("type").is(requestedResource.getType()));
        resourceQuery.addCriteria(Criteria.where("status").is(ResourceStatus.ACTIVE));
        resourceQuery.addCriteria(Criteria.where("capacity").gte(expectedAttendees != null ? expectedAttendees : 0));
        resourceQuery.addCriteria(Criteria.where("id").ne(resourceId));

        List<Resource> candidates = mongoTemplate.find(resourceQuery, Resource.class);

        // 3. Filter candidates by availability for the requested time slot
        List<SuggestedResourceDTO> suggestions = candidates.stream()
                .filter(res -> {
                    Query conflictQuery = new Query();
                    conflictQuery.addCriteria(Criteria.where("resourceId").is(res.getId()));
                    conflictQuery.addCriteria(Criteria.where("date").is(date));
                    conflictQuery.addCriteria(Criteria.where("status").in(List.of(BookingStatus.PENDING, BookingStatus.APPROVED)));
                    
                    // MongoDB overlap condition: booking.startTime < requestedEnd AND booking.endTime > requestedStart
                    conflictQuery.addCriteria(Criteria.where("startTime").lt(endTime));
                    conflictQuery.addCriteria(Criteria.where("endTime").gt(startTime));

                    return !mongoTemplate.exists(conflictQuery, Booking.class);
                })
                // 4. Sort by closest capacity (smallest capacity that still fits the expectedAttendees)
                .sorted((r1, r2) -> {
                    int diff1 = r1.getCapacity() - (expectedAttendees != null ? expectedAttendees : 0);
                    int diff2 = r2.getCapacity() - (expectedAttendees != null ? expectedAttendees : 0);
                    return Integer.compare(diff1, diff2);
                })
                .limit(3)
                .map(res -> SuggestedResourceDTO.builder()
                        .resourceId(res.getId())
                        .resourceName(res.getName())
                        .type(res.getType().name())
                        .capacity(res.getCapacity())
                        .location(res.getLocation())
                        .build())
                .collect(Collectors.toList());

        return BookingSuggestionResponseDTO.builder()
                .conflictMessage("The requested resource '" + requestedResource.getName() + "' is already booked for this time.")
                .suggestions(suggestions)
                .build();
    }
}
