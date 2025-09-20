package com.prism.data.model

import java.time.LocalDateTime

data class LedgerEntry(
    val hash: String,
    val timestamp: LocalDateTime,
    val deviceId: String,
    val blockHeight: Long
)