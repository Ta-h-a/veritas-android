package com.prism.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDateTime

@Entity(tableName = "evidence")
data class Evidence(
    @PrimaryKey val id: String,
    val mediaUri: String,
    val mediaType: String, // PHOTO, VIDEO, DOCUMENT
    val timestamp: LocalDateTime,
    val gpsLocation: GpsLocation? = null,
    val deviceId: String,
    val signature: String,
    val hash: String,
    val aiValidationResult: AiValidationResult,
    val uploadStatus: String = "PENDING", // PENDING, UPLOADED, FAILED
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

data class GpsLocation(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float
)

data class AiValidationResult(
    val isValid: Boolean,
    val confidence: Float,
    val detectedSubjects: List<String>
)