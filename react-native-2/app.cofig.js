// app.config.js
export default ({ config }) => ({
  ...config,
  name: "Veritas Mobile",
  slug: "veritas-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#6200ee"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.veritas.mobile",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#6200ee"
    },
    package: "com.veritas.mobile",
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE"
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    [
      "expo-camera",
      {
        cameraPermission: "Allow Veritas to access your camera to scan barcodes and capture images."
      }
    ]
  ],
  extra: {
    // Backend API configuration
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080",
    
    // Client-side encryption key (Base64 encoded 256-bit key)
    clientEncryptionKey: process.env.EXPO_PUBLIC_CLIENT_ENCRYPTION_KEY || "YourBase64EncodedClientEncryptionKeyHere==",
  }
});