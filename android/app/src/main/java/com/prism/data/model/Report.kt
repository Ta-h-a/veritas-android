package com.prism.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDateTime

@Entity(tableName = "reports")
data class Report(
    @PrimaryKey val id: String,
    val title: String,
    val description: String? = null,
    val formData: Map<String, Any>, // JSON-like data
    val status: String = "DRAFT", // DRAFT, SUBMITTED, APPROVED
    val createdBy: String,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)