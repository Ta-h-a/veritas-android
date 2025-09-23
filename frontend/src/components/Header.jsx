import React from "react";
import styles from "./Header.module.css";

const SUPPORTED_FORMATS = [
  "EAN-13",
  "Code-128", 
  "QR Code",
  "Data Matrix",
  "UPC-A/E",
  "Code-39",
  "PDF417",
  "ITF-14",
];

function Header() {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>🔍 Samsung ZXing Image Scanner</h1>
      <p>Advanced static image barcode analysis using ZXing library</p>
      <div className={styles.techBadge}>ZXing MultiFormatReader</div>

      <div className={styles.formatSupport}>
        <strong>📋 Supported Formats:</strong>
        <div className={styles.formatList}>
          {SUPPORTED_FORMATS.map((fmt) => (
            <span key={fmt} className={styles.formatTag}>
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Header;