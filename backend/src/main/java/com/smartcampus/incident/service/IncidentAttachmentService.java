package com.smartcampus.incident.service;

import com.smartcampus.incident.dto.IncidentResponses.AttachmentResponse;
import com.smartcampus.incident.exception.IncidentExceptions.InvalidRequestException;
import com.smartcampus.incident.exception.IncidentExceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class IncidentAttachmentService {

    private static final String METADATA_SEPARATOR = "::";

    private final Path storageRoot;

    public IncidentAttachmentService(@Value("${incident.attachments.storage-dir:uploads/incidents}") String storageDir) {
        this.storageRoot = Paths.get(storageDir).toAbsolutePath().normalize();
    }

    public List<String> storeAttachments(String incidentId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        createStorageDirectory();
        List<String> storedMetadata = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String originalFileName = sanitizeOriginalFileName(file.getOriginalFilename());
            String attachmentId = UUID.randomUUID().toString();
            String storedFileName = buildStoredFileName(incidentId, attachmentId, originalFileName);
            Path targetPath = storageRoot.resolve(storedFileName).normalize();

            ensureWithinStorageRoot(targetPath);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                throw new InvalidRequestException("Failed to store attachment " + originalFileName);
            }

            storedMetadata.add(serialize(attachmentId, originalFileName, normalizeContentType(file.getContentType()), storedFileName));
        }

        return storedMetadata;
    }

    public AttachmentResponse toResponse(String incidentId, String storedValue) {
        ParsedAttachment parsedAttachment = parse(storedValue);
        if (!parsedAttachment.isPersisted()) {
            return new AttachmentResponse(
                    null,
                    parsedAttachment.fileName(),
                    parsedAttachment.contentType(),
                    null,
                    null
            );
        }

        String baseUrl = "/incidents/" + incidentId + "/attachments/" + parsedAttachment.id();
        return new AttachmentResponse(
                parsedAttachment.id(),
                parsedAttachment.fileName(),
                parsedAttachment.contentType(),
                baseUrl,
                baseUrl + "?download=true"
        );
    }

    public StoredAttachment resolveStoredAttachment(List<String> storedValues, String attachmentId) {
        if (storedValues == null || storedValues.isEmpty()) {
            throw new ResourceNotFoundException("Attachment not found");
        }

        for (String storedValue : storedValues) {
            ParsedAttachment parsedAttachment = parse(storedValue);
            if (parsedAttachment.isPersisted() && parsedAttachment.id().equals(attachmentId)) {
                Path filePath = storageRoot.resolve(parsedAttachment.storedFileName()).normalize();
                ensureWithinStorageRoot(filePath);

                if (!Files.exists(filePath)) {
                    throw new ResourceNotFoundException("Attachment file is missing");
                }

                return new StoredAttachment(filePath, parsedAttachment.fileName(), parsedAttachment.contentType());
            }
        }

        throw new ResourceNotFoundException("Attachment not found");
    }

    private void createStorageDirectory() {
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException ex) {
            throw new InvalidRequestException("Failed to initialize attachment storage");
        }
    }

    private String buildStoredFileName(String incidentId, String attachmentId, String originalFileName) {
        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFileName.substring(dotIndex);
        }
        return incidentId + "-" + attachmentId + extension;
    }

    private String sanitizeOriginalFileName(String originalFileName) {
        String fallback = "attachment";
        if (originalFileName == null || originalFileName.isBlank()) {
            return fallback;
        }

        String sanitized = Path.of(originalFileName).getFileName().toString().trim();
        return sanitized.isEmpty() ? fallback : sanitized;
    }

    private String serialize(String id, String fileName, String contentType, String storedFileName) {
        return id
                + METADATA_SEPARATOR + encode(fileName)
                + METADATA_SEPARATOR + encode(contentType)
                + METADATA_SEPARATOR + encode(storedFileName);
    }

    private ParsedAttachment parse(String storedValue) {
        if (storedValue == null || storedValue.isBlank()) {
            return new ParsedAttachment(null, "Attachment", "application/octet-stream", null, false);
        }

        String[] parts = storedValue.split(METADATA_SEPARATOR, 4);
        if (parts.length < 4) {
            return new ParsedAttachment(null, storedValue, "application/octet-stream", null, false);
        }

        return new ParsedAttachment(
                parts[0],
                decode(parts[1]),
                normalizeContentType(decode(parts[2])),
                decode(parts[3]),
                true
        );
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private String decode(String value) {
        return URLDecoder.decode(value == null ? "" : value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "application/octet-stream";
        }
        return contentType.toLowerCase(Locale.ROOT);
    }

    private void ensureWithinStorageRoot(Path targetPath) {
        if (!targetPath.startsWith(storageRoot)) {
            throw new InvalidRequestException("Invalid attachment path");
        }
    }

    public record StoredAttachment(Path path, String fileName, String contentType) {
    }

    private record ParsedAttachment(String id, String fileName, String contentType, String storedFileName, boolean isPersisted) {
    }
}
