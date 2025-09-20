package com.prism.data.local

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.prism.data.model.AiValidationResult
import com.prism.data.model.GpsLocation
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

class Converters {
    private val gson = Gson()
    private val formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    @TypeConverter
    fun fromTimestamp(value: String?): LocalDateTime? {
        return value?.let { LocalDateTime.parse(it, formatter) }
    }

    @TypeConverter
    fun dateToTimestamp(date: LocalDateTime?): String? {
        return date?.format(formatter)
    }

    @TypeConverter
    fun fromGpsLocation(value: String?): GpsLocation? {
        return value?.let { gson.fromJson(it, GpsLocation::class.java) }
    }

    @TypeConverter
    fun gpsLocationToString(location: GpsLocation?): String? {
        return location?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun fromAiValidationResult(value: String?): AiValidationResult? {
        return value?.let { gson.fromJson(it, AiValidationResult::class.java) }
    }

    @TypeConverter
    fun aiValidationResultToString(result: AiValidationResult?): String? {
        return result?.let { gson.toJson(it) }
    }

    @TypeConverter
    fun fromStringMap(value: String?): Map<String, Any>? {
        return value?.let {
            val type = object : TypeToken<Map<String, Any>>() {}.type
            gson.fromJson(it, type)
        }
    }

    @TypeConverter
    fun stringMapToString(map: Map<String, Any>?): String? {
        return map?.let { gson.toJson(it) }
    }
}