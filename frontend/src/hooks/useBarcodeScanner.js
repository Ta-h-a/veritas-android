import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/library";
import { BARCODE_PRIORITIES } from "../constants";
import { enrichResult, validateBarcode } from "../utils";

export function useBarcodeScanner() {
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

  const codeReaderRef = useRef(null);

  useEffect(() => {
    try {
      codeReaderRef.current = new BrowserMultiFormatReader();
      setStatus("ZXing MultiFormatReader initialized successfully");
    } catch (error) {
      setStatus(`ZXing initialization failed: ${error.message}`);
    }
  }, []);

  const processFile = (file) => {
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
  };

  const scanImage = async () => {
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
          ...scannedResults.map((r) => enrichResult(r, BARCODE_PRIORITIES)),
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
  };

  const clearResults = () => {
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
  };

  return {
    uploadedImage,
    results,
    status,
    processing,
    stats,
    processFile,
    scanImage,
    clearResults,
  };
}