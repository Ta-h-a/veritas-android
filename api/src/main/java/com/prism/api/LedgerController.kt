package com.prism.api

import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/ledger")
class LedgerController {

    @GetMapping("/verify/{hash}")
    fun verifyHash(@PathVariable hash: String): Map<String, Any> {
        // TODO: Check ledger for hash
        val exists = hash.startsWith("existing") // Mock logic
        return if (exists) {
            mapOf(
                "exists" to true,
                "entry" to mapOf(
                    "hash" to hash,
                    "timestamp" to "2025-09-20T10:00:00Z",
                    "deviceId" to "device123",
                    "blockHeight" to 1L
                )
            )
        } else {
            mapOf("exists" to false)
        }
    }
}