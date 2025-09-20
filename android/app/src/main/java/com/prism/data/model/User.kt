package com.prism.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.LocalDateTime

@Entity(tableName = "users")
data class User(
    @PrimaryKey val id: String, // From Knox authentication
    val role: String, // FIELD_AGENT, ADMIN, AUDITOR
    val certificateAlias: String,
    val lastLogin: LocalDateTime? = null
)