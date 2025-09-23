import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/library";
import "./App.css";

const BARCODE_PRIORITIES = {
  EAN_13: { tier: 1, priority: "ESSENTIAL", name: "EAN-13" },
  CODE_128: { tier: 1, priority: "ESSENTIAL", name: "Code-128" },
  QR_CODE: { tier: 2, priority: "IMPORTANT", name: "QR Code" },
  DATA_MATRIX: { tier: 2, priority: "IMPORTANT", name: "Data Matrix" },
  PDF_417: { tier: 2, priority: "IMPORTANT", name: "PDF417" },
  UPC_A: { tier: 3, priority: "ADDITIONAL", name: "UPC-A" },
  UPC_E: { tier: 3, priority: "ADDITIONAL", name: "UPC-E" },
  ITF: { tier: 3, priority: "ADDITIONAL", name: "ITF-14" },
  CODE_39: { tier: 3, priority: "ADDITIONAL", name: "Code-39" },
  CODABAR: { tier: 3, priority: "ADDITIONAL", name: "Codabar" },
};

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState(
    "Ready to analyze barcode images with ZXing"
  );
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalScans: 0,
    barcodeCount: 0,
    indiaProducts: 0,
    samsungProducts: 0,
  });
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    try {
      codeReaderRef.current = new BrowserMultiFormatReader();
      setStatus("ZXing MultiFormatReader initialized successfully");
    } catch (error) {
      setStatus(`ZXing initialization failed: ${error.message}`);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  function processFile(file) {
    if (!file.type.startsWith("image/")) {
      setStatus("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setStatus(
        `Image loaded: ${file.name} (${Math.round(file.size / 1024)}KB)`
      );
      setResults([]);
    };
    reader.readAsDataURL(file);
  }

  async function scanImage() {
    if (!uploadedImage) {
      setStatus("No image uploaded");
      return;
    }
    if (!codeReaderRef.current) {
      setStatus("ZXing reader not initialized");
      return;
    }
    setProcessing(true);
    setStatus("Analyzing image with ZXing MultiFormatReader...");
    try {
      const decodeResult = await codeReaderRef.current.decodeFromImageUrl(
        uploadedImage
      );
      let scannedResults = [];
      if (decodeResult) {
        const code = decodeResult.getText();
        const format = decodeResult.getBarcodeFormat();
        const formatName =
          BarcodeFormat[format] || decodeResult.getBarcodeFormat();
        scannedResults.push({
          code,
          format: formatName,
          timestamp: new Date(),
          points: decodeResult.getResultPoints(),
        });
      }

      setStats((prevStats) => ({
        ...prevStats,
        totalScans: prevStats.totalScans + 1,
        barcodeCount: prevStats.barcodeCount + scannedResults.length,
        indiaProducts:
          prevStats.indiaProducts +
          scannedResults.filter(
            (r) => validateBarcode(r.code, r.format).isIndiaProduct
          ).length,
        samsungProducts:
          prevStats.samsungProducts +
          scannedResults.filter(
            (r) => validateBarcode(r.code, r.format).isSamsung
          ).length,
      }));

      if (scannedResults.length > 0) {
        setResults((prev) => [
          ...scannedResults.map((r) => enrichResult(r)),
          ...prev,
        ]);
        setStatus(`ZXing found ${scannedResults.length} barcode(s) in image`);
      } else {
        setStatus(
          "No barcodes detected by ZXing. Try a higher quality image or different format."
        );
      }
    } catch (error) {
      console.error("ZXing scan error:", error);
      setStatus(`ZXing analysis failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  }

  function enrichResult(scanResult) {
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

  function validateBarcode(code, format) {
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

  function calculateConfidence(code, format) {
    let confidence = 85;
    if (format === "EAN_13" || format === "CODE_128") confidence += 10;
    if (format === "QR_CODE") confidence += 5;
    if (code.length >= 8) confidence += 5;
    return Math.min(confidence, 100);
  }

  function clearResults() {
    if (window.confirm("Clear all results and uploaded image?")) {
      setResults([]);
      setStats({
        totalScans: 0,
        barcodeCount: 0,
        indiaProducts: 0,
        samsungProducts: 0,
      });
      setUploadedImage(null);
      setStatus("Results cleared");
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🔍 Samsung ZXing Image Scanner</h1>
        <p>Advanced static image barcode analysis using ZXing library</p>
        <div className="tech-badge">ZXing MultiFormatReader</div>

        <div className="format-support">
          <strong>📋 Supported Formats:</strong>
          <div className="format-list">
            {[
              "EAN-13",
              "Code-128",
              "QR Code",
              "Data Matrix",
              "UPC-A/E",
              "Code-39",
              "PDF417",
              "ITF-14",
            ].map((fmt) => (
              <span key={fmt} className="format-tag">
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-value">{stats.totalScans}</div>
          <div className="stat-label">Images Processed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.barcodeCount}</div>
          <div className="stat-label">Barcodes Found</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.indiaProducts}</div>
          <div className="stat-label">India Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.samsungProducts}</div>
          <div className="stat-label">Samsung Products</div>
        </div>
      </div>

      <div className="upload-section">
        <div
          className={`upload-area${dragOver ? " dragover" : ""}`}
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">🖼️</div>
          <div className="upload-text">
            Upload barcode image for ZXing analysis
          </div>
          <div className="upload-hint">
            Click here or drag and drop image files
            <br />
            Supports: JPG, PNG, WEBP, BMP, GIF
          </div>
        </div>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          multiple={false}
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <div className="controls">
          <button className="btn btn-primary" onClick={handleUploadClick}>
            📂 Choose Images
          </button>
          <button
            className="btn btn-secondary"
            onClick={scanImage}
            disabled={!uploadedImage || processing}
          >
            🔍 Analyze with ZXing
          </button>
          <button className="btn btn-warning" onClick={clearResults}>
            🗑️ Clear Results
          </button>
        </div>

        {uploadedImage && (
          <img
            src={uploadedImage}
            alt="Uploaded preview"
            className="image-preview"
          />
        )}

        {processing && (
          <div className="processing-indicator" style={{ display: "flex" }}>
            <div className="spinner"></div>
            <span>Analyzing image with ZXing MultiFormatReader...</span>
          </div>
        )}

        <div
          className={`status ${
            status.toLowerCase().includes("success")
              ? "success"
              : status.toLowerCase().includes("error")
              ? "error"
              : status.toLowerCase().includes("analyzing")
              ? "processing"
              : ""
          }`}
        >
          {status}
        </div>
      </div>

      <div className="results">
        <h3>
          📊 ZXing Analysis Results{" "}
          {results.length > 0 ? `(${results.length} barcodes found)` : ""}
        </h3>
        <div id="resultsList">
          {results.length === 0 && <div>No images analyzed yet</div>}

          {results.map((result, idx) => (
            <div
              key={idx}
              className={`result-item tier-${result.priority.tier}`}
            >
              <div className="barcode-code">{result.code}</div>
              <div className="barcode-meta">
                <div className="meta-item">
                  <span className="meta-label">Format:</span>
                  {result.priority.name}
                </div>
                <div className="meta-item">
                  <span className="meta-label">Tier:</span>
                  {result.priority.tier} ({result.priority.priority})
                </div>
                <div className="meta-item">
                  <span className="meta-label">Confidence:</span>
                  {result.confidence}%
                </div>
                <div className="meta-item">
                  <span className="meta-label">Engine:</span>
                  ZXing MultiFormatReader
                </div>
              </div>
              {result.validation.messages.length > 0 && (
                <>
                  <div className="validation-badges">
                    {result.validation.isIndiaProduct && (
                      <span className="badge india">🇮🇳 INDIA</span>
                    )}
                    {result.validation.isSamsung && (
                      <span className="badge samsung">📱 SAMSUNG</span>
                    )}
                    <span className={`badge tier-${result.priority.tier}`}>
                      TIER {result.priority.tier}
                    </span>
                    {result.format === "QR_CODE" && (
                      <span className="badge qr">QR</span>
                    )}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>
                    {result.validation.messages.join(" • ")}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
