package com.prism.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.prism.ui.capture.EvidenceCaptureScreen
import com.prism.ui.report.ReportCreationScreen
import com.prism.ui.verification.EvidenceVerificationScreen
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    PrismApp()
                }
            }
        }
    }
}

@Composable
fun PrismApp() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "capture") {
        composable("capture") {
            EvidenceCaptureScreen(navController)
        }
        composable("report") {
            ReportCreationScreen(navController)
        }
        composable("verify") {
            EvidenceVerificationScreen(navController)
        }
    }
}