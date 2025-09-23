/**
 * Barcode validation utilities
 */

export function validateBarcode(code, format) {
  const validation = {
    isIndiaProduct: false,
    isSamsung: false,
    messages: [],
  };

  if (format === "EAN_13" && code.startsWith("890")) {
    validation.isIndiaProduct = true;
    validation.messages.push("🇮🇳 Indian EAN-13 (890 prefix)");

    if (code.startsWith("8909")) {
      validation.isSamsung = true;
      validation.messages.push("📱 Samsung Electronics India");
    }
  }

  if (format === "CODE_128") {
    if (
      code.includes("SAMSUNG") ||
      code.includes("SM-") ||
      code.includes("Galaxy")
    ) {
      validation.isSamsung = true;
      validation.messages.push("📱 Samsung product identifier");
    }
    if (
      code.includes("BIS") ||
      code.includes("ISI") ||
      code.includes("INDIA")
    ) {
      validation.isIndiaProduct = true;
      validation.messages.push("🇮🇳 India certification mark");
    }
    if (code.includes("http://") || code.includes("https://")) {
      validation.messages.push("🔗 URL data in Code-128");
    }
  }

  if (format === "QR_CODE") {
    validation.messages.push("📱 QR Code detected");

    if (code.includes("samsung.com") || code.includes("samsung.in")) {
      validation.isSamsung = true;
      validation.messages.push("📱 Samsung QR Code");
    }
    if (code.includes(".in") || code.includes("india")) {
      validation.isIndiaProduct = true;
      validation.messages.push("🇮🇳 India-related QR");
    }
  }

  return validation;
}

export function calculateConfidence(code, format) {
  let confidence = 85;
  if (format === "EAN_13" || format === "CODE_128") confidence += 10;
  if (format === "QR_CODE") confidence += 5;
  if (code.length >= 8) confidence += 5;
  return Math.min(confidence, 100);
}

export function enrichResult(scanResult, BARCODE_PRIORITIES) {
  const validation = validateBarcode(scanResult.code, scanResult.format);
  const priority = BARCODE_PRIORITIES[scanResult.format] || {
    tier: 3,
    priority: "UNKNOWN",
    name: scanResult.format,
  };

  return {
    ...scanResult,
    priority,
    validation,
    confidence: calculateConfidence(scanResult.code, scanResult.format),
  };
}