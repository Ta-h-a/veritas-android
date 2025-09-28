import { useState, useCallback } from 'react';

export function useTesseract() {
  const [extractedText, setExtractedText] = useState('');
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState('');
  const [confidence, setConfidence] = useState(0);

  const extractText = useCallback(async (imageFile) => {
    if (!imageFile) {
      setExtractionStatus('No image file provided');
      return;
    }

    setExtracting(true);
    setExtractionStatus('Extracting text from image...');
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('http://localhost:8080/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setExtractedText(result.text || '');
        setConfidence(result.confidence || 0);
        setExtractionStatus(`Text extracted successfully (Confidence: ${result.confidence?.toFixed(1)}%)`);
      } else {
        setExtractionStatus(`Error: ${result.message || 'Failed to extract text'}`);
        setExtractedText('');
        setConfidence(0);
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtractionStatus(`Error: ${error.message}`);
      setExtractedText('');
      setConfidence(0);
    } finally {
      setExtracting(false);
    }
  }, []);

  const clearTextData = useCallback(() => {
    setExtractedText('');
    setBarcodeNumber('');
    setExtractionStatus('');
    setConfidence(0);
  }, []);

  const updateBarcodeNumber = useCallback((value) => {
    setBarcodeNumber(value);
  }, []);

  const updateExtractedText = useCallback((value) => {
    setExtractedText(value);
  }, []);

  return {
    extractedText,
    barcodeNumber,
    extracting,
    extractionStatus,
    confidence,
    extractText,
    clearTextData,
    updateBarcodeNumber,
    updateExtractedText,
  };
}