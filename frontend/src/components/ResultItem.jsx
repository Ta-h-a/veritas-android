import React from "react";
import { Flag, Smartphone } from "lucide-react";
import styles from "./ResultItem.module.css";

function ResultItem({ result }) {
  const getTierClassName = () => {
    const baseClass = styles.resultItem;
    if (result.priority.tier === 1) {
      return `${baseClass} ${styles.tier1}`;
    }
    if (result.priority.tier === 2) {
      return `${baseClass} ${styles.tier2}`;
    }
    return baseClass;
  };

  const getBadgeClassName = (type) => {
    const baseClass = styles.badge;
    switch (type) {
      case 'india':
        return `${baseClass} ${styles.india}`;
      case 'samsung':
        return `${baseClass} ${styles.samsung}`;
      case 'qr':
        return `${baseClass} ${styles.qr}`;
      case 'tier1':
        return `${baseClass} ${styles.tier1}`;
      case 'tier2':
        return `${baseClass} ${styles.tier2}`;
      default:
        return baseClass;
    }
  };

  return (
    <div className={getTierClassName()}>
      <div className={`${styles.barcodeCode} subheading`}>
        {result.isOcrOnly ? 'OCR Analysis Only' : 
         result.isSubmittedResult ? 'Combined Analysis Result' : 
         result.code}
      </div>
      <div className={styles.barcodeMeta}>
        <div className={`${styles.metaItem} text`}>
          <span className={styles.metaLabel}>Format:</span>
          {result.priority.name}
        </div>
        <div className={`${styles.metaItem} text`}>
          <span className={styles.metaLabel}>Tier:</span>
          {result.priority.tier} ({result.priority.priority})
        </div>
        {result.code && result.code !== 'N/A' && result.code !== 'No barcode detected' && (
          <div className={`${styles.metaItem} text`}>
            <span className={styles.metaLabel}>Barcode Number:</span>
            {result.code}
          </div>
        )}
        <div className={`${styles.metaItem} text`}>
          <span className={styles.metaLabel}>Analysis Engine:</span>
          {result.isOcrOnly ? 'Tesseract OCR Only' : 
           result.isSubmittedResult ? 'ZXing + Tesseract OCR' :
           result.hasOcrData ? 'ZXing + OCR Combined' : 'ZXing MultiFormatReader'}
        </div>
      </div>
      {result.extractedText && (
        <div className={styles.extractedText}>
          <div className={`${styles.metaLabel} text`}>Extracted Text (OCR):</div>
          <div className={`${styles.textContent} text`}>{result.extractedText}</div>
        </div>
      )}
      {result.validation.messages.length > 0 && (
        <>
          <div className={styles.validationBadges}>
            {result.validation.isIndiaProduct && (
              <span className={`${getBadgeClassName('india')} text`}>
                <Flag className={styles.badgeIcon} /> INDIA
              </span>
            )}
            {result.validation.isSamsung && (
              <span className={`${getBadgeClassName('samsung')} text`}>
                <Smartphone className={styles.badgeIcon} /> SAMSUNG
              </span>
            )}
            <span className={`${getBadgeClassName(`tier${result.priority.tier}`)} text`}>
              TIER {result.priority.tier}
            </span>
            {result.format === "QR_CODE" && (
              <span className={`${getBadgeClassName('qr')} text`}>QR</span>
            )}
          </div>
          <div className={`${styles.validationMessages} text`}>
            {result.validation.messages.join(" • ")}
          </div>
        </>
      )}
    </div>
  );
}

export default ResultItem;