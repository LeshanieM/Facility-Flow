package com.smartcampus.exception;

import com.smartcampus.facility.exception.FacilityExceptions.InvalidResourceOperationException;
import com.smartcampus.facility.exception.FacilityExceptions.ResourceNotFoundException;
import com.smartcampus.incident.exception.IncidentExceptions.IllegalIncidentStateException;
import com.smartcampus.incident.exception.IncidentExceptions.InvalidRequestException;
import com.smartcampus.incident.exception.IncidentExceptions.UnauthorizedIncidentAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    @ExceptionHandler(InvalidResourceOperationException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidResourceOperationException(InvalidResourceOperationException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage());
    }

    @ExceptionHandler(com.smartcampus.incident.exception.IncidentExceptions.ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleIncidentResourceNotFoundException(com.smartcampus.incident.exception.IncidentExceptions.ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidRequestException(InvalidRequestException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedIncidentAccessException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedIncidentAccessException(UnauthorizedIncidentAccessException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage());
    }

    @ExceptionHandler(IllegalIncidentStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalIncidentStateException(IllegalIncidentStateException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Conflict", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        // You might want to log the exception stack trace here in a real production scenario
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(status).body(body);
    }
}
