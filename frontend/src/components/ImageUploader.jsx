import React, { useState, useRef } from "react";
import { ImageIcon, FolderOpen, ScanLine, Trash2 } from "lucide-react";
import styles from "./ImageUploader.module.css";

function ImageUploader({ 
  uploadedImage, 
  onFileProcess, 
  onScan, 
  onClear, 
  processing, 
  status 
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
          onClick={onScan}
          disabled={!uploadedImage || processing}
        >
          <ScanLine className={styles.buttonIcon} />
          Analyze with ZXing
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

      {processing && (
        <div className={`${styles.processingIndicator} ${styles.visible}`}>
          <div className={styles.spinner}></div>
          <span className="text">Analyzing image with ZXing MultiFormatReader...</span>
        </div>
      )}

      <div className={`${getStatusClassName()} text`}>
        {status}
      </div>
    </div>
  );
}

export default ImageUploader;