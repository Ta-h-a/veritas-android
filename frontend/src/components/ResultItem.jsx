import React from "react";
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
      <div className={styles.barcodeCode}>{result.code}</div>
      <div className={styles.barcodeMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Format:</span>
          {result.priority.name}
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Tier:</span>
          {result.priority.tier} ({result.priority.priority})
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Confidence:</span>
          {result.confidence}%
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Engine:</span>
          ZXing MultiFormatReader
        </div>
      </div>
      {result.validation.messages.length > 0 && (
        <>
          <div className={styles.validationBadges}>
            {result.validation.isIndiaProduct && (
              <span className={getBadgeClassName('india')}>🇮🇳 INDIA</span>
            )}
            {result.validation.isSamsung && (
              <span className={getBadgeClassName('samsung')}>📱 SAMSUNG</span>
            )}
            <span className={getBadgeClassName(`tier${result.priority.tier}`)}>
              TIER {result.priority.tier}
            </span>
            {result.format === "QR_CODE" && (
              <span className={getBadgeClassName('qr')}>QR</span>
            )}
          </div>
          <div className={styles.validationMessages}>
            {result.validation.messages.join(" • ")}
          </div>
        </>
      )}
    </div>
  );
}

export default ResultItem;