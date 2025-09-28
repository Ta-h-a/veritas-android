import React, { useEffect } from "react";
import { useBarcodeScanner, useTesseract } from "./hooks";
import { Header, StatsBar, ImageUploader, ResultsList } from "./components";
import "./styles/global.css";
import "./styles/utilities.css"

function App() {
  const {
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
  } = useBarcodeScanner();

  const tesseractHook = useTesseract();
  const {
    extractedText,
    barcodeNumber,
    extracting,
    extractionStatus,
    extractText,
    clearTextData,
    updateBarcodeNumber,
    updateExtractedText,
  } = tesseractHook;

  const handleClearAll = () => {
    clearResults();
    clearTextData();
  };

  // Watch for ZXing temporary results and auto-populate barcode field
  useEffect(() => {
    if (tempAnalysisResult && tempAnalysisResult.code) {
      updateBarcodeNumber(tempAnalysisResult.code);
    }
  }, [tempAnalysisResult, updateBarcodeNumber]);

  const handleAnalyze = async () => {
    if (uploadedFile) {
      // Clear any previous form data before starting new analysis
      updateExtractedText('');
      updateBarcodeNumber('');
      
      // Run both ZXing analysis and OCR extraction simultaneously
      await Promise.allSettled([
        scanImage ? scanImage() : Promise.resolve(null),
        extractText ? extractText(uploadedFile) : Promise.resolve(null)
      ]);
      
      // Results will populate the form fields but won't be added to results until Submit is clicked
    } else {
      console.log('No file available for analysis');
    }
  };

  const handleSubmitData = (barcodeNum, ocrText) => {
    console.log('Submitted data:', {
      barcodeNumber: barcodeNum,
      extractedText: ocrText
    });
    
    // Use the scanner hook function to add submitted result
    addSubmittedResult(barcodeNum, ocrText);
    
    // Clear form data after successful submission
    updateBarcodeNumber('');
    updateExtractedText('');
    
    alert('Data submitted successfully!');
  };

  return (
    <div className="container">
      <Header />
      <StatsBar stats={stats} />
      <ImageUploader
        uploadedImage={uploadedImage}
        onFileProcess={processFile}
        onAnalyze={handleAnalyze}
        onClear={handleClearAll}
        processing={processing}
        status={status}
        // Tesseract related props
        extracting={extracting}
        extractionStatus={extractionStatus}
        extractedText={extractedText}
        onExtractedTextChange={updateExtractedText}
        barcodeNumber={barcodeNumber}
        onBarcodeNumberChange={updateBarcodeNumber}
        onSubmitData={handleSubmitData}
      />
      <ResultsList results={results} />
    </div>
  );
}

export default App;
