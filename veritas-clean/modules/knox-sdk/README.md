# Veritas Knox SDK Module

Enterprise-ready Samsung Knox security integration for the Veritas Clean inventory management suite. This Expo native module adds hardware-backed encryption, device attestation, and audit logging to your React Native application with graceful fallbacks on non-Knox devices.

## Features

- ✅ Knox availability detection with security posture scoring (HIGH / MEDIUM / LOW)
- 🔐 AES-GCM encryption/decryption with automatic Samsung Knox key usage when present
- ✍️ RSA-PSS signing & signature verification for payload integrity
- 🛡️ Device trust signals: root detection, secure storage checks, secure fingerprint
- 🧾 Built-in audit trail with persistent storage and query APIs
- 🧩 JavaScript fallbacks for development platforms without Knox support

## Getting Started

### 1. Install dependencies

From the app workspace root:

```bash
npm install
```

The module declares `expo-modules-core` as a dependency. Ensure your Expo app is configured for development builds (`expo run:android`) and that Samsung Knox SDK licensing is set up for production deployments.

### 2. Add the module to your app

The module is located at `modules/knox-sdk`. You can reference it via a relative path using npm workspaces or Metro aliases. Example import:

```ts
import KnoxSdk from '@veritas/knox-sdk';

const secureRegister = async (payload: DevicePayload) => {
  const encrypted = await KnoxSdk.encryptData(JSON.stringify(payload));
  const signature = await KnoxSdk.signData(encrypted);

  return api.post('/devices/register', {
    payload: encrypted,
    knoxSignature: signature,
  });
};
```

### 3. Configure Android

1. **Minimum SDK**: The module targets API level 21+.
2. **Permissions**: Add the required Samsung Knox permissions to your app manifest:

   ```xml
   <uses-permission android:name="com.samsung.android.knox.permission.KNOX_INTERNAL_EXCEPTION" />
   <uses-permission android:name="com.samsung.android.knox.permission.KNOX_DEVICE_CONFIGURATION" />
   <uses-permission android:name="com.samsung.android.knox.permission.KNOX_SECURITY" />
   ```

3. **ProGuard/R8**: The module ships with consumer rules to keep Knox classes. Make sure your app references them (handled automatically when consuming the library).
4. **Licensing**: Obtain a Samsung Knox developer license. Call the Knox activation APIs before using protected features (outside the scope of this module – see Samsung documentation).

### 4. API Surface

All functions return promises and resolve with Knox results or secure fallbacks when Knox is unavailable.

| Function | Description |
|----------|-------------|
| `isKnoxEnabled()` | Returns `true` when Knox services are present and initialized on the device. |
| `getSecurityLevel()` | Returns `"HIGH"`, `"MEDIUM"`, or `"LOW"` based on Knox availability, hardware-backed keystore, and root status. |
| `isDeviceRooted()` | Performs multi-check root detection (build tags, binaries, shell commands). |
| `hasSecureStorage()` | Confirms hardware-backed keystore support (fallbacks to software keystore otherwise). |
| `encryptData(plaintext)` | Encrypts data with Knox keys (if available) or Android Keystore AES-GCM fallback. |
| `decryptData(ciphertext)` | Companion decrypt call. |
| `signData(data)` | Generates an RSA-PSS signature via Knox or Android Keystore. |
| `verifySignature(data, signature)` | Validates the signature. |
| `getDeviceId()` | Retrieves the Knox device identifier or Android secure ID fallback. |
| `getSecureDeviceInfo()` | Returns device metadata, security posture, Knox configuration, and license status. |
| `getDeviceFingerprint()` | Provides a SHA-256 fingerprint derived from stable hardware identifiers. |
| `logAuditEvent(action, details)` | Persists a signed audit record. |
| `getAuditLogs(limit?)` | Retrieves recent audit records (default: full history up to the internal cap). |

### 5. Fallback Behavior

When running on non-Samsung devices or in environments where the native module is unavailable (web, Jest), the JavaScript shim provides:

- Base64 encoding for encryption/decryption (for dev/testing only)
- SHA-256 hashing via WebCrypto (if available) for signatures
- Ephemeral audit log storage in memory
- Synthetic device identifiers and security posture reporting

The Kotlin implementation always attempts hardware-backed operations first and transparently falls back to secure Android Keystore equivalents.

### 6. Testing

Run the module test suite from `modules/knox-sdk`:

```bash
npm run test
```

The tests exercise the JavaScript fallback implementation and validate core invariants (encryption round-trip, signature verification, audit logging).

### 7. Integration Checklist

- [ ] Run `npx expo run:android` to ensure the module builds inside your dev client.
- [ ] Wire `KnoxSdk` calls into your screens/services (`DeviceFormScreen`, `AdminLoginScreen`, etc.).
- [ ] Trigger license activation and validation on Samsung hardware.
- [ ] Capture audit events for sensitive workflows (enrollment, login, data export).
- [ ] Verify fallback behavior on non-Knox hardware/emulators.

## Support & Troubleshooting

- **Knox License Errors**: Verify the license key has been activated for your package name and signature.
- **`KnoxSdk` undefined**: Ensure the development build includes this module (`expo prebuild` or `expo run:android`). Clean and rebuild if needed.
- **Permission Denied**: Add the Knox permissions and confirm the device is enrolled in your Knox enterprise profile.

For advanced Knox policy management, consult the [Samsung Knox Developer Documentation](https://docs.samsungknox.com/devref/knox-sdk/dev-guide.htm).
