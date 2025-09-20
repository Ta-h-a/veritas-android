package com.prism.data.model

import org.junit.Assert.*
import org.junit.Test
import java.time.LocalDateTime

class EvidenceTest {

    @Test
    fun testEvidenceCreation() {
        val evidence = Evidence(
            id = "test_id",
            mediaUri = "/path/to/media",
            mediaType = "PHOTO",
            timestamp = LocalDateTime.now(),
            deviceId = "device123",
            signature = "signature",
            hash = "hash",
            aiValidationResult = AiValidationResult(true, 0.9f, listOf("car"))
        )

        assertEquals("test_id", evidence.id)
        assertEquals("PHOTO", evidence.mediaType)
        assertTrue(evidence.aiValidationResult.isValid)
    }
}