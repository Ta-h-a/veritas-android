package com.prism.ui.report

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.prism.data.model.Report
import com.prism.data.repository.ReportRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReportCreationViewModel @Inject constructor(
    private val reportRepository: ReportRepository
) : ViewModel() {

    private val _reportState = MutableStateFlow<ReportState>(ReportState.Idle)
    val reportState: StateFlow<ReportState> = _reportState

    fun createReport(title: String, description: String?, formData: Map<String, Any>) {
        viewModelScope.launch {
            _reportState.value = ReportState.Creating

            try {
                val report = Report(
                    id = generateId(),
                    title = title,
                    description = description,
                    formData = formData,
                    createdBy = "current_user" // TODO: Get from auth
                )

                reportRepository.insertReport(report)
                _reportState.value = ReportState.Success(report)
            } catch (e: Exception) {
                _reportState.value = ReportState.Error(e.message ?: "Unknown error")
            }
        }
    }

    private fun generateId(): String {
        // TODO: Generate unique ID
        return "report_id_placeholder"
    }

    sealed class ReportState {
        object Idle : ReportState()
        object Creating : ReportState()
        data class Success(val report: Report) : ReportState()
        data class Error(val message: String) : ReportState()
    }
}