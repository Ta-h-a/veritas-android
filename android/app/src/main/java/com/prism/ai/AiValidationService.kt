package com.prism.ai

import com.prism.data.model.AiValidationResult
import java.io.File

class AiValidationService {

    suspend fun validateEvidence(mediaFile: File): AiValidationResult {
        // TODO: Pass file to local AI module, receive JSON response
        // For now, return mock result
        return AiValidationResult(
            isValid = true,
            confidence = 0.95f,
            detectedSubjects = listOf("car", "damage")
        )
    }
}