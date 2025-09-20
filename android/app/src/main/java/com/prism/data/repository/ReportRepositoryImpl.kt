package com.prism.data.repository

import com.prism.data.local.ReportDao
import com.prism.data.model.Report
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReportRepositoryImpl @Inject constructor(
    private val reportDao: ReportDao
) : ReportRepository {

    override fun getAllReports(): Flow<List<Report>> = reportDao.getAllReports()

    override fun getReportById(id: String): Flow<Report?> = reportDao.getReportById(id)

    override suspend fun insertReport(report: Report) = reportDao.insertReport(report)

    override suspend fun updateReport(report: Report) = reportDao.updateReport(report)

    override suspend fun deleteReport(report: Report) = reportDao.deleteReport(report)
}