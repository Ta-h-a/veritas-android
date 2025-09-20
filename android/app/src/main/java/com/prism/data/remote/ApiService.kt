package com.prism.data.remote

import com.prism.data.model.LedgerEntry
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {

    @POST("evidence/upload")
    suspend fun uploadEvidence(@Body evidence: Map<String, Any>): Response<Map<String, Any>>

    @GET("ledger/verify/{hash}")
    suspend fun verifyHash(@Path("hash") hash: String): Response<Map<String, Any>>
}