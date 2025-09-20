package com.prism.ui.verification

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prism.data.remote.ApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.io.File
import javax.inject.Inject

@HiltViewModel
class EvidenceVerificationViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _verificationState = MutableStateFlow<VerificationState>(VerificationState.Idle)
    val verificationState: StateFlow<VerificationState> = _verificationState

    fun verifyEvidence(mediaFile: File) {
        viewModelScope.launch {
            _verificationState.value = VerificationState.Verifying

            try {
                val hash = generateHash(mediaFile)
                val response = apiService.verifyHash(hash)

                if (response.isSuccessful) {
                    val data = response.body()
                    val exists = data?.get("exists") as? Boolean ?: false
                    _verificationState.value = if (exists) VerificationState.Authentic else VerificationState.Fake
                } else {
                    _verificationState.value = VerificationState.Error("Verification failed")
                }
            } catch (e: Exception) {
                _verificationState.value = VerificationState.Error(e.message ?: "Unknown error")
            }
        }
    }

    private fun generateHash(file: File): String {
        // TODO: Implement SHA-256 hash
        return "hash_placeholder"
    }

    sealed class VerificationState {
        object Idle : VerificationState()
        object Verifying : VerificationState()
        object Authentic : VerificationState()
        object Fake : VerificationState()
        data class Error(val message: String) : VerificationState()
    }
}