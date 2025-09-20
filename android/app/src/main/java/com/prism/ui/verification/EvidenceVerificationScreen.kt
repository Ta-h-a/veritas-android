package com.prism.ui.verification

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController

@Composable
fun EvidenceVerificationScreen(
    navController: NavController,
    viewModel: EvidenceVerificationViewModel = hiltViewModel()
) {
    val verificationState by viewModel.verificationState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Verify Evidence", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(32.dp))

        Button(onClick = {
            // TODO: Implement file picker
        }) {
            Text("Select Media File")
        }

        Spacer(modifier = Modifier.height(32.dp))

        when (verificationState) {
            is EvidenceVerificationViewModel.VerificationState.Verifying -> {
                CircularProgressIndicator()
                Text("Verifying...")
            }
            is EvidenceVerificationViewModel.VerificationState.Authentic -> {
                Text("✅ Authentic", color = MaterialTheme.colorScheme.primary)
            }
            is EvidenceVerificationViewModel.VerificationState.Fake -> {
                Text("❌ Fake", color = MaterialTheme.colorScheme.error)
            }
            is EvidenceVerificationViewModel.VerificationState.Error -> {
                Text("Error: ${(verificationState as EvidenceVerificationViewModel.VerificationState.Error).message}")
            }
            else -> {}
        }
    }
}