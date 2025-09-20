package com.prism.data.local

import androidx.room.*
import com.prism.data.model.Evidence
import kotlinx.coroutines.flow.Flow

@Dao
interface EvidenceDao {
    @Query("SELECT * FROM evidence")
    fun getAllEvidence(): Flow<List<Evidence>>

    @Query("SELECT * FROM evidence WHERE id = :id")
    fun getEvidenceById(id: String): Flow<Evidence?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvidence(evidence: Evidence)

    @Update
    suspend fun updateEvidence(evidence: Evidence)

    @Delete
    suspend fun deleteEvidence(evidence: Evidence)
}