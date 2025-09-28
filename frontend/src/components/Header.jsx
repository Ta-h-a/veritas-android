import React from "react";
import { ScanLine, List } from "lucide-react";
import styles from "./Header.module.css";
import { UserButton } from "@clerk/clerk-react";

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
      <div className={styles.headerTop}>
        <h1 className={`${styles.title} heading`}>
          <ScanLine className={styles.titleIcon} />
          Dex Veritas
        </h1>
        <div className={styles.userSection}>
          <UserButton />
        </div>
      </div>
      <div className={`${styles.techBadge} text`}>ZXing MultiFormatReader</div>

      <div className={styles.formatSupport}>
        <strong className="subheading">
          <List className={styles.listIcon} />
          Supported Formats:
        </strong>
        <div className={styles.formatList}>
          {SUPPORTED_FORMATS.map((fmt) => (
            <span key={fmt} className={`${styles.formatTag} text`}>
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Header;
