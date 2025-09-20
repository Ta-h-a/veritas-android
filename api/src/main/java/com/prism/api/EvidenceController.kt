package com.prism.api

import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/evidence")
class EvidenceController {

    @PostMapping("/upload")
    fun uploadEvidence(@RequestBody evidence: Map<String, Any>): Map<String, Any> {
        // TODO: Process evidence, sign, store on ledger
        return mapOf(
            "evidenceId" to "generated_id",
            "ledgerEntry" to mapOf(
                "hash" to evidence["hash"],
                "timestamp" to evidence["timestamp"],
                "deviceId" to evidence["deviceId"],
                "blockHeight" to 1L
            )
        )
    }
}