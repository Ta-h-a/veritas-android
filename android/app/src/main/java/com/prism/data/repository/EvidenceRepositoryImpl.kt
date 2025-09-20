package com.prism.data.repository

import com.prism.data.local.EvidenceDao
import com.prism.data.model.Evidence
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EvidenceRepositoryImpl @Inject constructor(
    private val evidenceDao: EvidenceDao
) : EvidenceRepository {

    override fun getAllEvidence(): Flow<List<Evidence>> = evidenceDao.getAllEvidence()

    override fun getEvidenceById(id: String): Flow<Evidence?> = evidenceDao.getEvidenceById(id)

    override suspend fun insertEvidence(evidence: Evidence) = evidenceDao.insertEvidence(evidence)

    override suspend fun updateEvidence(evidence: Evidence) = evidenceDao.updateEvidence(evidence)

    override suspend fun deleteEvidence(evidence: Evidence) = evidenceDao.deleteEvidence(evidence)
}