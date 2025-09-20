package com.prism.ui.capture

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prism.ai.AiValidationService
import com.prism.data.model.Evidence
import com.prism.data.repository.EvidenceRepository
import com.prism.security.KnoxSecurityService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.io.File
import java.time.LocalDateTime
import javax.inject.Inject

@HiltViewModel
class EvidenceCaptureViewModel @Inject constructor(
    private val evidenceRepository: EvidenceRepository,
    private val knoxSecurityService: KnoxSecurityService,
    private val aiValidationService: AiValidationService
) : ViewModel() {

    private val _captureState = MutableStateFlow<CaptureState>(CaptureState.Idle)
    val captureState: StateFlow<CaptureState> = _captureState

    fun captureEvidence(mediaFile: File, mediaType: String) {
        viewModelScope.launch {
            _captureState.value = CaptureState.Processing

            try {
                // Generate hash and signature
                val hash = generateHash(mediaFile)
                val signature = knoxSecurityService.generateSignature(mediaFile.readBytes(), "evidence_key")
                val deviceId = knoxSecurityService.getDeviceId()

                // AI validation
                val aiResult = aiValidationService.validateEvidence(mediaFile)

                val evidence = Evidence(
                    id = generateId(),
                    mediaUri = mediaFile.absolutePath,
                    mediaType = mediaType,
                    timestamp = LocalDateTime.now(),
                    deviceId = deviceId,
                    signature = signature,
                    hash = hash,
                    aiValidationResult = aiResult
                )

                evidenceRepository.insertEvidence(evidence)
                _captureState.value = CaptureState.Success(evidence)
            } catch (e: Exception) {
                _captureState.value = CaptureState.Error(e.message ?: "Unknown error")
            }
        }
    }

    private fun generateHash(file: File): String {
        // TODO: Implement SHA-256 hash
        return "hash_placeholder"
    }

    private fun generateId(): String {
        // TODO: Generate unique ID
        return "id_placeholder"
    }

    sealed class CaptureState {
        object Idle : CaptureState()
        object Processing : CaptureState()
        data class Success(val evidence: Evidence) : CaptureState()
        data class Error(val message: String) : CaptureState()
    }
}