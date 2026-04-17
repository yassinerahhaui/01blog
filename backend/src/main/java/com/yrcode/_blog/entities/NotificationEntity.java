package com.yrcode._blog.entities;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEntity extends AbstractEntity {

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(nullable = false)
    @lombok.Builder.Default
    private Boolean isRead = false;
}
