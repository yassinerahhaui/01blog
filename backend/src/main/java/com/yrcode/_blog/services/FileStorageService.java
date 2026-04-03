package com.yrcode._blog.services;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;

import org.apache.tika.Tika; // Added Tika import

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import com.yrcode._blog.shared.CustomResponseException;

@Service
public class FileStorageService {
    @Autowired
    private MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.url}")
    private String minioUrl;

    // List of allowed MIME types for security purposes
    private final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/webm"
    );

    @SuppressWarnings("UseSpecificCatch")
    public String uploadFile(MultipartFile file) {
        try {
            // --- SECURITY CHECK WITH APACHE TIKA ---
            // Initialize Tika to inspect the actual file content
            Tika tika = new Tika();
            
            // Detect the real content type based on the file's magic bytes, not its extension
            String realContentType = tika.detect(file.getInputStream());

            // If the detected type is not in our allowed list, reject the upload
            if (!ALLOWED_CONTENT_TYPES.contains(realContentType)) {
                throw CustomResponseException.BadRequest("Security Alert: Invalid file content! Detected type: " + realContentType);
            }
            // ---------------------------------------

            // Generate a unique filename to prevent overwriting existing files
            String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename().replace(" ", "_");

            // Upload the safe file to the MinIO bucket
            InputStream inputStream = file.getInputStream();
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(realContentType) // Use the safe, Tika-detected content type here
                            .build()
            );

            // Return the public URL so it can be saved in the database
            return minioUrl + "/" + bucketName + "/" + fileName;

        } catch (IllegalArgumentException e) {
            // Re-throw the validation exception so the controller can return a 400 Bad Request
            throw CustomResponseException.BadRequest("invalid file!");
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to MinIO: " + e.getMessage());
        }
    }
}