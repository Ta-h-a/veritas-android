package com.prism.ai

import org.junit.Assert.*
import org.junit.Test
import java.io.File

class AiValidationServiceTest {

    private val service = AiValidationService()

    @Test
    fun testValidateEvidence() {
        // Mock file
        val file = File.createTempFile("test", ".jpg")
        val result = service.validateEvidence(file)

        assertNotNull(result)
        assertTrue(result.isValid)
        assertTrue(result.confidence > 0)
    }
}