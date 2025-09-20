package com.prism.data.sync

import com.prism.data.remote.ApiService
import com.prism.data.repository.EvidenceRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncManager @Inject constructor(
    private val evidenceRepository: EvidenceRepository,
    private val apiService: ApiService
) {

    private val scope = CoroutineScope(Dispatchers.IO)

    fun syncPendingEvidence() {
        scope.launch {
            // TODO: Get pending evidence and upload
            // For now, placeholder
        }
    }
}