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

  const handleSubmitData = async (barcodeNum, ocrText) => {
    console.log('Submitted data:', {
      barcodeNumber: barcodeNum,
      extractedText: ocrText
    });
    
    try {
      // Prepare data for backend submission
      const submissionData = {
        clerk_id: 'dummy_clerk_123', // Dummy clerk ID
        clerk_email: 'dummy@example.com', // Dummy email
        barcode_number: barcodeNum || '',
        ocr_text: ocrText || '',
        barcode_image: uploadedImage || '' // The uploaded image data URL
      };

      // Send request to backend
      const response = await fetch('http://localhost:8080/api/clerkdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Data saved to backend with ID:', result.id);
        
        // Use the scanner hook function to add submitted result to UI
        addSubmittedResult(barcodeNum, ocrText);
        
        // Clear form data after successful submission
        updateBarcodeNumber('');
        updateExtractedText('');
        
        console.log('Data submitted and saved successfully!');
      } else {
        console.error('Backend save failed:', result.error);
        console.error('Failed to save data to backend: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting data to backend:', error);
      console.error('Error submitting data: ' + error.message);
    }
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
