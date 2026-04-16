package com.smartcampus.incident.exception;

public class IncidentExceptions {

    public static class IllegalIncidentStateException extends RuntimeException {
        public IllegalIncidentStateException(String message) {
            super(message);
        }
    }

    public static class UnauthorizedIncidentAccessException extends RuntimeException {
        public UnauthorizedIncidentAccessException(String message) {
            super(message);
        }
    }

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    public static class InvalidRequestException extends RuntimeException {
        public InvalidRequestException(String message) {
            super(message);
        }
    }
}
