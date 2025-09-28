# Keep Samsung Knox SDK classes to avoid stripping critical security APIs
-keep class com.samsung.android.knox.** { *; }
-dontwarn com.samsung.android.knox.**

# Preserve Kotlin metadata for reflection-based fallbacks
-keep class kotlin.Metadata { *; }
