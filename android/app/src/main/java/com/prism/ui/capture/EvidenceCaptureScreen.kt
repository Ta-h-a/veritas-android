package com.prism.ui.capture

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController

@Composable
fun EvidenceCaptureScreen(
    navController: NavController,
    viewModel: EvidenceCaptureViewModel = hiltViewModel()
) {
    val captureState by viewModel.captureState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Capture Evidence", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(32.dp))

        Button(onClick = {
            // TODO: Implement camera capture
        }) {
            Text("Take Photo")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = {
            // TODO: Implement video capture
        }) {
            Text("Record Video")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = {
            // TODO: Implement document scan
        }) {
            Text("Scan Document")
        }

        Spacer(modifier = Modifier.height(32.dp))

        when (captureState) {
            is EvidenceCaptureViewModel.CaptureState.Processing -> {
                CircularProgressIndicator()
                Text("Processing...")
            }
            is EvidenceCaptureViewModel.CaptureState.Success -> {
                Text("Evidence captured successfully!")
                Button(onClick = { navController.navigate("report") }) {
                    Text("Create Report")
                }
            }
            is EvidenceCaptureViewModel.CaptureState.Error -> {
                Text("Error: ${(captureState as EvidenceCaptureViewModel.CaptureState.Error).message}")
            }
            else -> {}
        }
    }
}