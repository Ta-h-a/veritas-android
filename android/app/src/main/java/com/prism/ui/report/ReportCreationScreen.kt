package com.prism.ui.report

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController

@Composable
fun ReportCreationScreen(
    navController: NavController,
    viewModel: ReportCreationViewModel = hiltViewModel()
) {
    val reportState by viewModel.reportState.collectAsState()

    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Create Report", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = {
                viewModel.createReport(title, description, emptyMap()) // TODO: Add form data
            },
            enabled = title.isNotBlank()
        ) {
            Text("Create Report")
        }

        Spacer(modifier = Modifier.height(16.dp))

        when (reportState) {
            is ReportCreationViewModel.ReportState.Creating -> {
                CircularProgressIndicator()
                Text("Creating report...")
            }
            is ReportCreationViewModel.ReportState.Success -> {
                Text("Report created successfully!")
                Button(onClick = { navController.navigate("verify") }) {
                    Text("Verify Evidence")
                }
            }
            is ReportCreationViewModel.ReportState.Error -> {
                Text("Error: ${(reportState as ReportCreationViewModel.ReportState.Error).message}")
            }
            else -> {}
        }
    }
}