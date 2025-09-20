package com.prism.data.repository

import com.prism.data.model.Report
import kotlinx.coroutines.flow.Flow

interface ReportRepository {
    fun getAllReports(): Flow<List<Report>>
    fun getReportById(id: String): Flow<Report?>
    suspend fun insertReport(report: Report)
    suspend fun updateReport(report: Report)
    suspend fun deleteReport(report: Report)
}