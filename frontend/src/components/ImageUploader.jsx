import React, { useState, useRef } from "react";
import { ImageIcon, FolderOpen, ScanLine, Trash2, Send, MapPin } from "lucide-react";
import styles from "./ImageUploader.module.css";

// Location and Category Input Component
function LocationCategoryInputs({ state, city, category, onStateChange, onCityChange, onCategoryChange }) {
  // State-City mapping data structure
  const locationData = {
    maharashtra: {
      label: 'Maharashtra',
      cities: [
        { value: 'mumbai', label: 'Mumbai' },
        { value: 'pune', label: 'Pune' },
        { value: 'nagpur', label: 'Nagpur' },
        { value: 'nashik', label: 'Nashik' },
        { value: 'aurangabad', label: 'Aurangabad' },
        { value: 'solapur', label: 'Solapur' },
        { value: 'kolhapur', label: 'Kolhapur' }
      ]
    },
    karnataka: {
      label: 'Karnataka',
      cities: [
        { value: 'bengaluru', label: 'Bengaluru' },
        { value: 'mysuru', label: 'Mysuru' },
        { value: 'hubli', label: 'Hubli' },
        { value: 'mangaluru', label: 'Mangaluru' },
        { value: 'belagavi', label: 'Belagavi' },
        { value: 'gulbarga', label: 'Gulbarga' },
        { value: 'davanagere', label: 'Davanagere' }
      ]
    },
    andhra_pradesh: {
      label: 'Andhra Pradesh',
      cities: [
        { value: 'visakhapatnam', label: 'Visakhapatnam' },
        { value: 'vijayawada', label: 'Vijayawada' },
        { value: 'guntur', label: 'Guntur' },
        { value: 'nellore', label: 'Nellore' },
        { value: 'kurnool', label: 'Kurnool' },
        { value: 'rajahmundry', label: 'Rajahmundry' },
        { value: 'tirupati', label: 'Tirupati' }
      ]
    },
    telangana: {
      label: 'Telangana',
      cities: [
        { value: 'hyderabad', label: 'Hyderabad' },
        { value: 'warangal', label: 'Warangal' },
        { value: 'nizamabad', label: 'Nizamabad' },
        { value: 'karimnagar', label: 'Karimnagar' },
        { value: 'khammam', label: 'Khammam' },
        { value: 'mahbubnagar', label: 'Mahbubnagar' }
      ]
    },
    delhi: {
      label: 'New Delhi',
      cities: [
        { value: 'new_delhi', label: 'New Delhi' },
        { value: 'old_delhi', label: 'Old Delhi' },
        { value: 'south_delhi', label: 'South Delhi' },
        { value: 'north_delhi', label: 'North Delhi' },
        { value: 'east_delhi', label: 'East Delhi' },
        { value: 'west_delhi', label: 'West Delhi' }
      ]
    },
    tamil_nadu: {
      label: 'Tamil Nadu',
      cities: [
        { value: 'chennai', label: 'Chennai' },
        { value: 'coimbatore', label: 'Coimbatore' },
        { value: 'madurai', label: 'Madurai' },
        { value: 'salem', label: 'Salem' },
        { value: 'tiruchirappalli', label: 'Tiruchirappalli' },
        { value: 'tirunelveli', label: 'Tirunelveli' },
        { value: 'vellore', label: 'Vellore' }
      ]
    },
    gujarat: {
      label: 'Gujarat',
      cities: [
        { value: 'ahmedabad', label: 'Ahmedabad' },
        { value: 'surat', label: 'Surat' },
        { value: 'vadodara', label: 'Vadodara' },
        { value: 'rajkot', label: 'Rajkot' },
        { value: 'bhavnagar', label: 'Bhavnagar' },
        { value: 'jamnagar', label: 'Jamnagar' },
        { value: 'gandhinagar', label: 'Gandhinagar' }
      ]
    },
    west_bengal: {
      label: 'West Bengal',
      cities: [
        { value: 'kolkata', label: 'Kolkata' },
        { value: 'howrah', label: 'Howrah' },
        { value: 'durgapur', label: 'Durgapur' },
        { value: 'asansol', label: 'Asansol' },
        { value: 'siliguri', label: 'Siliguri' },
        { value: 'malda', label: 'Malda' }
      ]
    }
  };

  const states = [
    { value: '', label: 'Select State' },
    ...Object.keys(locationData).map(key => ({
      value: key,
      label: locationData[key].label
    }))
  ];

  // Get cities for selected state
  const getCitiesForState = (selectedState) => {
    if (!selectedState || !locationData[selectedState]) {
      return [{ value: '', label: 'Select City' }];
    }
    return [
      { value: '', label: 'Select City' },
      ...locationData[selectedState].cities
    ];
  };

  const cities = getCitiesForState(state);

  // Product workflow categories
  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'storage_warehouse', label: 'Storage & Warehouse' },
    { value: 'distribution', label: 'Distribution Center' },
    { value: 'research_development', label: 'Research & Development' },
    { value: 'quality_control', label: 'Quality Control' },
    { value: 'supply_chain', label: 'Supply Chain Management' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'inventory_management', label: 'Inventory Management' },
    { value: 'production_planning', label: 'Production Planning' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'shipping_receiving', label: 'Shipping & Receiving' },
    { value: 'vendor_management', label: 'Vendor Management' },
    { value: 'asset_tracking', label: 'Asset Tracking' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  // Handle state change and reset city
  const handleStateChange = (newState) => {
    onStateChange && onStateChange(newState);
    // Reset city when state changes
    onCityChange && onCityChange('');
  };

  return (
    <div className={styles.locationCategorySection}>
      <div className={styles.locationIcon}>
        <MapPin className={styles.icon} />
        <span className={`${styles.locationTitle} text`}>Location & Category</span>
      </div>
      <div className={styles.inputsContainer}>
        <div className={styles.selectGroup}>
          <label htmlFor="state" className={styles.selectLabel}>State:</label>
          <select
            id="state"
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className={styles.selectInput}
            required
          >
            {states.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label htmlFor="city" className={styles.selectLabel}>City:</label>
          <select
            id="city"
            value={city}
            onChange={(e) => onCityChange && onCityChange(e.target.value)}
            className={styles.selectInput}
            required
          >
            {cities.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label htmlFor="category" className={styles.selectLabel}>Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
            className={styles.selectInput}
            required
          >
            {categories.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

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
  onSubmitData,
  // Location and category props
  state,
  city,
  category,
  onStateChange,
  onCityChange,
  onCategoryChange
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
      {/* Location and Category Inputs */}
      <LocationCategoryInputs
        state={state}
        city={city}
        category={category}
        onStateChange={onStateChange}
        onCityChange={onCityChange}
        onCategoryChange={onCategoryChange}
      />

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
              onClick={() => onSubmitData && onSubmitData(barcodeNumber, extractedText, state, city, category)}
              disabled={!barcodeNumber && !extractedText || !state || !city || !category}
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