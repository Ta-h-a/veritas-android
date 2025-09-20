package com.prism.data.repository

import com.prism.data.model.Evidence
import kotlinx.coroutines.flow.Flow

interface EvidenceRepository {
    fun getAllEvidence(): Flow<List<Evidence>>
    fun getEvidenceById(id: String): Flow<Evidence?>
    suspend fun insertEvidence(evidence: Evidence)
    suspend fun updateEvidence(evidence: Evidence)
    suspend fun deleteEvidence(evidence: Evidence)
}