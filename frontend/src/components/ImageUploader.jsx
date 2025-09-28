import React, { useState, useRef } from "react";
import { ImageIcon, FolderOpen, ScanLine, Trash2, Send } from "lucide-react";
import styles from "./ImageUploader.module.css";

function ImageUploader({ 
  uploadedImage, 
  onFileProcess, 
  onAnalyze, 
  onClear, 
  processing, 
  status,
  // Tesseract related props
  extracting,
  extractionStatus,
  extractedText,
  onExtractedTextChange,
  barcodeNumber,
  onBarcodeNumberChange,
  onSubmitData
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onFileProcess(e.target.files[0]);
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
      onFileProcess(e.dataTransfer.files[0]);
    }
  };

  const getStatusClassName = () => {
    const baseClass = styles.status;
    if (status.toLowerCase().includes("success")) {
      return `${baseClass} ${styles.success}`;
    }
    if (status.toLowerCase().includes("error")) {
      return `${baseClass} ${styles.error}`;
    }
    if (status.toLowerCase().includes("analyzing")) {
      return `${baseClass} ${styles.processing}`;
    }
    return baseClass;
  };

  return (
    <div className={styles.uploadSection}>
      <div
        className={`${styles.uploadArea}${dragOver ? ` ${styles.dragover}` : ""}`}
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.uploadIcon}>
          <ImageIcon />
        </div>
        <div className={`${styles.uploadText} subheading`}>
          Upload barcode image for ZXing analysis
        </div>
        <div className={`${styles.uploadHint} text`}>
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

      <div className={styles.controls}>
        <button className={`${styles.btn} ${styles.btnPrimary} text`} onClick={handleUploadClick}>
          <FolderOpen className={styles.buttonIcon} />
          Choose Images
        </button>
        <button
          className={`${styles.btn} ${styles.btnSecondary} text`}
          onClick={onAnalyze}
          disabled={!uploadedImage || processing || extracting}
        >
          <ScanLine className={styles.buttonIcon} />
          Analyze
        </button>
        <button className={`${styles.btn} ${styles.btnWarning} text`} onClick={onClear}>
          <Trash2 className={styles.buttonIcon} />
          Clear Results
        </button>
      </div>

      {uploadedImage && (
        <img
          src={uploadedImage}
          alt="Uploaded preview"
          className={styles.imagePreview}
        />
      )}

      {(processing || extracting) && (
        <div className={`${styles.processingIndicator} ${styles.visible}`}>
          <div className={styles.spinner}></div>
          <span className="text">
            {processing && extracting 
              ? "Analyzing image with ZXing and extracting text with OCR..." 
              : processing 
                ? "Analyzing image with ZXing MultiFormatReader..." 
                : "Extracting text from image using Tesseract OCR..."}
          </span>
        </div>
      )}

      <div className={`${getStatusClassName()} text`}>
        {status}
      </div>

      {extractionStatus && (
        <div className={`${styles.status} text`}>
          {extractionStatus}
        </div>
      )}

      {/* Text Extraction Form */}
      {(extractedText || barcodeNumber) && (
        <div className={styles.textExtractionForm}>
          <div className={styles.formGroup}>
            <label htmlFor="barcodeNumber" className={styles.label}>
              Barcode Number:
            </label>
            <input
              id="barcodeNumber"
              type="text"
              value={barcodeNumber}
              onChange={(e) => onBarcodeNumberChange && onBarcodeNumberChange(e.target.value)}
              placeholder="Enter or scan barcode number"
              className={styles.textInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="extractedText" className={styles.label}>
              Extracted Text:
            </label>
            <textarea
              id="extractedText"
              value={extractedText}
              onChange={(e) => onExtractedTextChange && onExtractedTextChange(e.target.value)}
              placeholder="Extracted text will appear here..."
              rows={6}
              className={styles.textArea}
            />
          </div>

          <div className={styles.formActions}>
            <button 
              className={`${styles.btn} ${styles.btnSuccess} text`}
              onClick={() => onSubmitData && onSubmitData(barcodeNumber, extractedText)}
              disabled={!barcodeNumber && !extractedText}
            >
              <Send className={styles.buttonIcon} />
              Submit Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;