package com.prism.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.prism.data.model.Evidence
import com.prism.data.model.Report
import com.prism.data.model.User

@Database(
    entities = [Evidence::class, Report::class, User::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun evidenceDao(): EvidenceDao
    abstract fun reportDao(): ReportDao
    abstract fun userDao(): UserDao
}