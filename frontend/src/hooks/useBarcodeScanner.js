import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/library";
import { BARCODE_PRIORITIES } from "../constants";
import { enrichResult, validateBarcode } from "../utils";

export function useBarcodeScanner() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [results, setResults] = useState([]);
  const [tempAnalysisResult, setTempAnalysisResult] = useState(null);
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
      setUploadedFile(file);
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
        // Store temporary result for form population instead of adding to results
        const enrichedResult = enrichResult(scannedResults[0], BARCODE_PRIORITIES);
        setTempAnalysisResult(enrichedResult);
        setStatus(`ZXing found ${scannedResults.length} barcode(s) in image`);
      } else {
        setTempAnalysisResult(null);
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

  const addOcrDataToLatestResult = (extractedText) => {
    if (extractedText) {
      setResults((prev) => {
        if (prev.length > 0) {
          // Update the most recent result with OCR data
          const updatedResults = [...prev];
          updatedResults[0] = {
            ...updatedResults[0],
            extractedText: extractedText,
            hasOcrData: true
          };
          return updatedResults;
        } else {
          // If no ZXing results, create an OCR-only result
          const ocrResult = {
            code: 'No barcode detected',
            format: 'OCR Only',
            timestamp: new Date(),
            extractedText: extractedText,
            isOcrOnly: true,
            priority: {
              name: 'OCR Text Extraction',
              tier: 1,
              priority: 'High'
            },
            validation: {
              messages: ['Text extracted using Tesseract OCR'],
              isIndiaProduct: false,
              isSamsung: false
            }
          };
          return [ocrResult, ...prev];
        }
      });
    }
  };

  const addSubmittedResult = (barcodeNumber, extractedText) => {
    const baseResult = tempAnalysisResult || {};
    
    const submittedResult = {
      code: barcodeNumber || baseResult.code || 'Manual Entry',
      format: baseResult.format || 'Manual',
      timestamp: new Date(),
      extractedText: extractedText || '',
      isSubmittedResult: true,
      priority: baseResult.priority || {
        name: 'Manual Entry + OCR',
        tier: 1,
        priority: 'High'
      },
      validation: baseResult.validation || {
        messages: ['Manual submission with OCR text'],
        isIndiaProduct: false,
        isSamsung: false
      }
    };
    
    setResults((prev) => [submittedResult, ...prev]);
    
    // Update stats
    setStats((prev) => ({
      ...prev,
      totalScans: prev.totalScans + 1,
      barcodeCount: prev.barcodeCount + (barcodeNumber ? 1 : 0)
    }));
    
    // Clear temporary analysis result after submission
    setTempAnalysisResult(null);
  };

  const addOcrResult = (barcodeNumber, extractedText) => {
    if (barcodeNumber || extractedText) {
      const ocrResult = {
        code: barcodeNumber || 'N/A',
        format: 'Combined Analysis',
        timestamp: new Date(),
        extractedText: extractedText || '',
        isSubmittedResult: true,
        priority: {
          name: 'ZXing + OCR Analysis',
          tier: 1,
          priority: 'High'
        },
        validation: {
          messages: ['Combined ZXing barcode detection and OCR text extraction'],
          isIndiaProduct: false,
          isSamsung: false
        }
      };
      
      setResults((prev) => [ocrResult, ...prev]);
    }
  };

  const clearResults = () => {
    if (window.confirm("Clear all results and uploaded image?")) {
      setResults([]);
      setTempAnalysisResult(null);
      setStats({
        totalScans: 0,
        barcodeCount: 0,
        indiaProducts: 0,
        samsungProducts: 0,
      });
      setUploadedImage(null);
      setUploadedFile(null);
      setStatus("Results cleared");
    }
  };

  return {
    uploadedImage,
    uploadedFile,
    results,
    tempAnalysisResult,
    status,
    processing,
    stats,
    processFile,
    scanImage,
    clearResults,
    addSubmittedResult,
    addOcrResult,
    addOcrDataToLatestResult,
  };
}