package expo.modules.knoxsdk

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.provider.Settings
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import com.samsung.android.knox.EnterpriseDeviceManager
import com.samsung.android.knox.container.KnoxConfigurationType
import com.samsung.android.knox.license.EnterpriseLicenseManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.nio.ByteBuffer
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.MessageDigest
import java.security.Signature
import java.util.UUID
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import kotlin.math.min

private const val LOG_TAG = "KnoxSdkModule"

class KnoxSdkModule : Module() {
  private val securityManager by lazy { KnoxSecurityManager(requireContext()) }

  override fun definition() = ModuleDefinition {
    Name("KnoxSdk")

    AsyncFunction("isKnoxEnabled") {
      securityManager.isKnoxEnabled()
    }

    AsyncFunction("getSecurityLevel") {
      securityManager.getSecurityLevel().value
    }

    AsyncFunction("isDeviceRooted") {
      securityManager.isDeviceRooted()
    }

    AsyncFunction("hasSecureStorage") {
      securityManager.hasSecureStorage()
    }

    AsyncFunction("encryptData") { data: String ->
      securityManager.encryptData(data)
    }

    AsyncFunction("decryptData") { cipherText: String ->
      securityManager.decryptData(cipherText)
    }

    AsyncFunction("signData") { data: String ->
      securityManager.signData(data)
    }

    AsyncFunction("verifySignature") { data: String, signature: String ->
      securityManager.verifySignature(data, signature)
    }

    AsyncFunction("getDeviceId") {
      securityManager.getDeviceId()
    }

    AsyncFunction("getSecureDeviceInfo") {
      securityManager.getSecureDeviceInfo()
    }

    AsyncFunction("getDeviceFingerprint") {
      securityManager.getDeviceFingerprint()
    }

    AsyncFunction("logAuditEvent") { action: String, details: Map<String, Any?>? ->
      securityManager.logAuditEvent(action, details ?: emptyMap())
    }

    AsyncFunction("getAuditLogs") { limit: Int? ->
      securityManager.getAuditLogs(limit)
    }
  }

  private fun requireContext(): Context {
    return appContext.reactContext?.applicationContext
      ?: throw IllegalStateException("React application context is unavailable.")
  }
}

private enum class SecurityLevel(val value: String) {
  HIGH("HIGH"),
  MEDIUM("MEDIUM"),
  LOW("LOW")
}

private data class AuditLog(
  val id: String,
  val action: String,
  val details: Map<String, Any?>,
  val timestamp: Long,
  val knoxEnabled: Boolean,
  val securityLevel: SecurityLevel
)

private class KnoxSecurityManager(private val context: Context) {
  companion object {
    private const val ANDROID_KEYSTORE = "AndroidKeyStore"
    private const val AES_ALIAS = "veritas_knox_aes"
    private const val RSA_ALIAS = "veritas_knox_rsa"
    private const val PREF_AUDIT = "veritas_knox_audit"
    private const val PREF_AUDIT_KEY = "logs"
    private const val MAX_AUDIT_LOGS = 200
  }

  private val keyStore: KeyStore = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
  private val preferences: SharedPreferences =
    context.getSharedPreferences(PREF_AUDIT, Context.MODE_PRIVATE)

  private val enterpriseDeviceManager: EnterpriseDeviceManager? by lazy {
    try {
      EnterpriseDeviceManager.getInstance(context)
    } catch (error: SecurityException) {
      Log.w(LOG_TAG, "EnterpriseDeviceManager unavailable", error)
      null
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Failed to initialize EnterpriseDeviceManager", error)
      null
    }
  }

  private val licenseManager: EnterpriseLicenseManager? by lazy {
    try {
      EnterpriseLicenseManager.getInstance(context)
    } catch (error: Exception) {
      Log.w(LOG_TAG, "EnterpriseLicenseManager unavailable", error)
      null
    }
  }

  fun isKnoxEnabled(): Boolean {
    if (!Build.MANUFACTURER.equals("samsung", ignoreCase = true)) {
      return false
    }

    val edm = enterpriseDeviceManager ?: return false
    return try {
      val method = edm.javaClass.methods.firstOrNull { it.name == "isDeviceSecurelyConfigured" && it.parameterTypes.isEmpty() }
      if (method != null) {
        method.invoke(edm) as? Boolean ?: false
      } else {
        // Fall back to checking Knox configuration type if available.
        getKnoxConfigurationTypeName(edm) != null
      }
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Knox check failed, assuming disabled", error)
      false
    }
  }

  fun getSecurityLevel(): SecurityLevel {
    val knoxEnabled = isKnoxEnabled()
    val rooted = isDeviceRooted()
    val secureStorage = hasSecureStorage()

    return when {
      knoxEnabled && secureStorage && !rooted -> SecurityLevel.HIGH
      secureStorage && !rooted -> SecurityLevel.MEDIUM
      else -> SecurityLevel.LOW
    }
  }

  fun isDeviceRooted(): Boolean {
    if (Build.TAGS?.contains("test-keys") == true) return true

    val suPaths = arrayOf(
      "/system/bin/su",
      "/system/xbin/su",
      "/system/app/Superuser.apk",
      "/sbin/su",
      "/system/sd/xbin/su",
      "/system/bin/failsafe/su",
      "/data/local/su",
      "/data/local/xbin/su",
      "/data/local/bin/su"
    )

    if (suPaths.any { File(it).exists() }) {
      return true
    }

    return canExecuteCommand("/system/xbin/which su") || canExecuteCommand("which su")
  }

  fun hasSecureStorage(): Boolean {
    return try {
      ensureAesKey()
      val entry = keyStore.getEntry(AES_ALIAS, null) as? KeyStore.SecretKeyEntry ?: return false
      val factory = SecretKeyFactory.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
      val keyInfo = factory.getKeySpec(entry.secretKey, KeyInfo::class.java) as KeyInfo
      keyInfo.isInsideSecureHardware
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Secure storage check failed", error)
      false
    }
  }

  fun encryptData(plainText: String): String {
    return try {
      val knoxCipher = encryptWithKnox(plainText)
      knoxCipher ?: encryptWithAndroidKeystore(plainText)
    } catch (error: Exception) {
      Log.e(LOG_TAG, "Encryption failed, falling back", error)
      encryptWithAndroidKeystore(plainText)
    }
  }

  fun decryptData(cipherText: String): String {
    return try {
      decryptWithKnox(cipherText) ?: decryptWithAndroidKeystore(cipherText)
    } catch (error: Exception) {
      Log.e(LOG_TAG, "Decryption failed, falling back", error)
      decryptWithAndroidKeystore(cipherText)
    }
  }

  fun signData(data: String): String {
    return try {
      val knoxSignature = signWithKnox(data)
      knoxSignature ?: signWithAndroidKeystore(data)
    } catch (error: Exception) {
      Log.e(LOG_TAG, "Signature failed, falling back", error)
      signWithAndroidKeystore(data)
    }
  }

  fun verifySignature(data: String, signature: String): Boolean {
    return try {
      verifyWithKnox(data, signature) ?: verifyWithAndroidKeystore(data, signature)
    } catch (error: Exception) {
      Log.e(LOG_TAG, "Signature verification failed, falling back", error)
      verifyWithAndroidKeystore(data, signature)
    }
  }

  fun getDeviceId(): String {
    val knoxId = try {
      knoxDeviceId()
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Unable to obtain Knox device identifier", error)
      null
    }

    if (!knoxId.isNullOrBlank()) {
      return knoxId
    }

    return Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
      ?: "UNKNOWN"
  }

  fun getSecureDeviceInfo(): Map<String, Any?> {
    val knoxEnabled = isKnoxEnabled()
    val securityLevel = getSecurityLevel()
    val configurationType = enterpriseDeviceManager?.let { getKnoxConfigurationTypeName(it) }

    return mapOf(
      "manufacturer" to Build.MANUFACTURER,
      "model" to Build.MODEL,
      "osVersion" to Build.VERSION.RELEASE,
      "securityPatch" to Build.VERSION.SECURITY_PATCH,
      "knox" to mapOf(
        "enabled" to knoxEnabled,
        "configuration" to configurationType,
        "licenseActive" to isLicenseActive()
      ),
      "securityLevel" to securityLevel.value,
      "rooted" to isDeviceRooted(),
      "hardwareBackedKeystore" to hasSecureStorage()
    )
  }

  fun getDeviceFingerprint(): String {
    val digest = MessageDigest.getInstance("SHA-256")
    val raw = listOf(
      Build.BOARD,
      Build.BRAND,
      Build.DEVICE,
      Build.DISPLAY,
      Build.FINGERPRINT,
      Build.HARDWARE,
      Build.MANUFACTURER,
      Build.MODEL,
      Build.PRODUCT,
      Build.VERSION.RELEASE,
      getDeviceId()
    ).joinToString(separator = "|")

    digest.update(raw.toByteArray(Charsets.UTF_8))
    return Base64.encodeToString(digest.digest(), Base64.NO_WRAP)
  }

  fun logAuditEvent(action: String, details: Map<String, Any?>): Boolean {
    val record = AuditLog(
      id = UUID.randomUUID().toString(),
      action = action,
      details = details,
      timestamp = System.currentTimeMillis(),
      knoxEnabled = isKnoxEnabled(),
      securityLevel = getSecurityLevel()
    )

    val logs = readAuditLogs().toMutableList()
    logs.add(0, record)
    if (logs.size > MAX_AUDIT_LOGS) {
      logs.subList(MAX_AUDIT_LOGS, logs.size).clear()
    }
    return persistAuditLogs(logs)
  }

  fun getAuditLogs(limit: Int?): List<Map<String, Any?>> {
    val logs = readAuditLogs()
    val slice = logs.take(min(limit ?: logs.size, logs.size))
    return slice.map { record ->
      mapOf(
        "id" to record.id,
        "action" to record.action,
        "details" to record.details,
        "timestamp" to record.timestamp,
        "knoxEnabled" to record.knoxEnabled,
        "securityLevel" to record.securityLevel.value
      )
    }
  }

  private fun encryptWithKnox(plainText: String): String? {
    val edm = enterpriseDeviceManager ?: return null
    return try {
      val keyManagerMethod = edm.javaClass.methods.firstOrNull { it.name == "getKnoxKeyManager" && it.parameterTypes.isEmpty() }
      val keyManager = keyManagerMethod?.invoke(edm) ?: return null
      val encryptMethod = keyManager.javaClass.methods.firstOrNull { it.name == "encrypt" && it.parameterTypes.size >= 2 }
      val alias = ensureKnoxAesKey(keyManager)
      val cipherBytes = if (encryptMethod != null) {
        val params = arrayOf(alias, plainText.toByteArray(Charsets.UTF_8))
        encryptMethod.invoke(keyManager, *params) as? ByteArray
      } else {
        null
      }
      cipherBytes?.let { Base64.encodeToString(it, Base64.NO_WRAP) }
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Knox encryption unavailable", error)
      null
    }
  }

  private fun decryptWithKnox(cipherText: String): String? {
    val edm = enterpriseDeviceManager ?: return null
    return try {
      val keyManagerMethod = edm.javaClass.methods.firstOrNull { it.name == "getKnoxKeyManager" && it.parameterTypes.isEmpty() }
      val keyManager = keyManagerMethod?.invoke(edm) ?: return null
      val decryptMethod = keyManager.javaClass.methods.firstOrNull { it.name == "decrypt" && it.parameterTypes.size >= 2 }
      val alias = ensureKnoxAesKey(keyManager)
      val cipherBytes = Base64.decode(cipherText, Base64.NO_WRAP)
      val plainBytes = if (decryptMethod != null) {
        val params = arrayOf(alias, cipherBytes)
        decryptMethod.invoke(keyManager, *params) as? ByteArray
      } else {
        null
      }
      plainBytes?.toString(Charsets.UTF_8)
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Knox decryption unavailable", error)
      null
    }
  }

  private fun signWithKnox(data: String): String? {
    val edm = enterpriseDeviceManager ?: return null
    return try {
      val keyManagerMethod = edm.javaClass.methods.firstOrNull { it.name == "getKnoxKeyManager" && it.parameterTypes.isEmpty() }
      val keyManager = keyManagerMethod?.invoke(edm) ?: return null
      val signMethod = keyManager.javaClass.methods.firstOrNull { it.name == "sign" && it.parameterTypes.size >= 2 }
      val alias = ensureKnoxRsaKey(keyManager)
      val signatureBytes = if (signMethod != null) {
        val params = arrayOf(alias, data.toByteArray(Charsets.UTF_8))
        signMethod.invoke(keyManager, *params) as? ByteArray
      } else {
        null
      }
      signatureBytes?.let { Base64.encodeToString(it, Base64.NO_WRAP) }
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Knox signing unavailable", error)
      null
    }
  }

  private fun verifyWithKnox(data: String, signature: String): Boolean? {
    val edm = enterpriseDeviceManager ?: return null
    return try {
      val keyManagerMethod = edm.javaClass.methods.firstOrNull { it.name == "getKnoxKeyManager" && it.parameterTypes.isEmpty() }
      val keyManager = keyManagerMethod?.invoke(edm) ?: return null
      val verifyMethod = keyManager.javaClass.methods.firstOrNull { it.name == "verify" && it.parameterTypes.size >= 3 }
      val alias = ensureKnoxRsaKey(keyManager)
      if (verifyMethod != null) {
        val signatureBytes = Base64.decode(signature, Base64.NO_WRAP)
        val params = arrayOf(alias, data.toByteArray(Charsets.UTF_8), signatureBytes)
        (verifyMethod.invoke(keyManager, *params) as? Boolean) ?: false
      } else {
        null
      }
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Knox signature verification unavailable", error)
      null
    }
  }

  private fun encryptWithAndroidKeystore(plainText: String): String {
    val secretKey = ensureAesKey()
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, secretKey)
    val iv = cipher.iv
    val encryptedPayload = cipher.doFinal(plainText.toByteArray(Charsets.UTF_8))

    val buffer = ByteBuffer.allocate(Int.SIZE_BYTES + iv.size + encryptedPayload.size)
    buffer.putInt(iv.size)
    buffer.put(iv)
    buffer.put(encryptedPayload)
    return Base64.encodeToString(buffer.array(), Base64.NO_WRAP)
  }

  private fun decryptWithAndroidKeystore(cipherText: String): String {
    val secretKey = ensureAesKey()
    val data = Base64.decode(cipherText, Base64.NO_WRAP)
    val buffer = ByteBuffer.wrap(data)
    val ivSize = buffer.int
    val iv = ByteArray(ivSize)
    buffer.get(iv)
    val cipherPayload = ByteArray(buffer.remaining())
    buffer.get(cipherPayload)

    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(128, iv))
    val plainBytes = cipher.doFinal(cipherPayload)
    return plainBytes.toString(Charsets.UTF_8)
  }

  private fun signWithAndroidKeystore(data: String): String {
    val keyPair = ensureRsaKeyPair()
    val signature = Signature.getInstance("SHA256withRSA/PSS")
    signature.initSign(keyPair.private)
    signature.update(data.toByteArray(Charsets.UTF_8))
    return Base64.encodeToString(signature.sign(), Base64.NO_WRAP)
  }

  private fun verifyWithAndroidKeystore(data: String, signature: String): Boolean {
    val keyPair = ensureRsaKeyPair()
    val verifier = Signature.getInstance("SHA256withRSA/PSS")
    verifier.initVerify(keyPair.public)
    verifier.update(data.toByteArray(Charsets.UTF_8))
    return try {
      verifier.verify(Base64.decode(signature, Base64.NO_WRAP))
    } catch (error: Exception) {
      false
    }
  }

  private fun ensureAesKey(): SecretKey {
    if (!keyStore.containsAlias(AES_ALIAS)) {
      val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
      val spec = KeyGenParameterSpec.Builder(
        AES_ALIAS,
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
      )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setRandomizedEncryptionRequired(true)
        .setUserAuthenticationRequired(false)
        .build()
      generator.init(spec)
      generator.generateKey()
    }
    return (keyStore.getEntry(AES_ALIAS, null) as KeyStore.SecretKeyEntry).secretKey
  }

  private fun ensureRsaKeyPair(): KeyPair {
    if (!keyStore.containsAlias(RSA_ALIAS)) {
      val generator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA, ANDROID_KEYSTORE)
      val spec = KeyGenParameterSpec.Builder(
        RSA_ALIAS,
        KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
      )
        .setDigests(KeyProperties.DIGEST_SHA256, KeyProperties.DIGEST_SHA512)
        .setSignaturePaddings(KeyProperties.SIGNATURE_PADDING_RSA_PSS)
        .build()
      generator.initialize(spec)
      generator.generateKeyPair()
    }
    val entry = keyStore.getEntry(RSA_ALIAS, null) as KeyStore.PrivateKeyEntry
    return KeyPair(entry.certificate.publicKey, entry.privateKey)
  }

  private fun knoxDeviceId(): String? {
    val edm = enterpriseDeviceManager ?: return null
    return try {
      val method = edm.javaClass.methods.firstOrNull { it.name == "getDeviceId" && it.parameterTypes.isEmpty() }
      when (val result = method?.invoke(edm)) {
        is String -> result
        else -> null
      }
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Failed to fetch Knox device id", error)
      null
    }
  }

  private fun getKnoxConfigurationTypeName(edm: EnterpriseDeviceManager): String? {
    return try {
      val method = edm.javaClass.methods.firstOrNull { it.name == "getKnoxConfigurationType" && it.parameterTypes.isEmpty() }
      val result = method?.invoke(edm)
      when (result) {
        is KnoxConfigurationType -> result.name
        is Enum<*> -> result.name
        else -> null
      }
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Unable to determine Knox configuration type", error)
      null
    }
  }

  private fun isLicenseActive(): Boolean {
    val manager = licenseManager ?: return false
    return try {
      val method = manager.javaClass.methods.firstOrNull { it.name == "isLicenseActivated" && it.parameterTypes.isEmpty() }
      if (method != null) {
        method.invoke(manager) as? Boolean ?: false
      } else {
        false
      }
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Failed to read Knox license status", error)
      false
    }
  }

  private fun ensureKnoxAesKey(keyManager: Any): String {
    return ensureKnoxKey(keyManager, AES_ALIAS, "AES")
  }

  private fun ensureKnoxRsaKey(keyManager: Any): String {
    return ensureKnoxKey(keyManager, RSA_ALIAS, "RSA")
  }

  private fun ensureKnoxKey(keyManager: Any, alias: String, algorithm: String): String {
    return try {
      val existsMethod = keyManager.javaClass.methods.firstOrNull { it.name == "containsAlias" }
      val createMethod = keyManager.javaClass.methods.firstOrNull { it.name == "generateKey" }
      val aliasObject = alias
      val exists = existsMethod?.invoke(keyManager, aliasObject) as? Boolean ?: false
      if (!exists && createMethod != null) {
        createMethod.invoke(keyManager, aliasObject, algorithm)
      }
      alias
    } catch (error: Exception) {
      Log.w(LOG_TAG, "Unable to ensure Knox key", error)
      alias
    }
  }

  private fun readAuditLogs(): List<AuditLog> {
    val raw = preferences.getString(PREF_AUDIT_KEY, null) ?: return emptyList()
    return try {
      val array = JSONArray(raw)
      buildList {
        for (i in 0 until array.length()) {
          val item = array.getJSONObject(i)
          val detailsJson = item.optJSONObject("details") ?: JSONObject()
          val detailsMap = mutableMapOf<String, Any?>()
          val keys = detailsJson.keys()
          while (keys.hasNext()) {
            val key = keys.next()
            detailsMap[key] = detailsJson.get(key)
          }
          add(
            AuditLog(
              id = item.optString("id"),
              action = item.optString("action"),
              details = detailsMap,
              timestamp = item.optLong("timestamp"),
              knoxEnabled = item.optBoolean("knoxEnabled"),
              securityLevel = SecurityLevel.values().firstOrNull { it.value == item.optString("securityLevel") }
                ?: SecurityLevel.LOW
            )
          )
        }
      }
    } catch (error: Exception) {
      Log.e(LOG_TAG, "Failed to parse audit log", error)
      emptyList()
    }
  }

  private fun persistAuditLogs(logs: List<AuditLog>): Boolean {
    return try {
      val array = JSONArray()
      logs.forEach { record ->
        val item = JSONObject()
        item.put("id", record.id)
        item.put("action", record.action)
        item.put("timestamp", record.timestamp)
        item.put("knoxEnabled", record.knoxEnabled)
        item.put("securityLevel", record.securityLevel.value)
        item.put("details", JSONObject(record.details))
        array.put(item)
      }
      preferences.edit().putString(PREF_AUDIT_KEY, array.toString()).apply()
      true
    } catch (error: Exception) {
      Log.e(LOG_TAG, "Failed to persist audit log", error)
      false
    }
  }

  private fun canExecuteCommand(command: String): Boolean {
    return try {
      val process = Runtime.getRuntime().exec(command)
      BufferedReader(InputStreamReader(process.inputStream)).use { it.readLine() != null }
    } catch (error: Exception) {
      false
    }
  }
}
