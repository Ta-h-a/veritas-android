import React from "react";
import styles from "./StatsBar.module.css";

function StatsBar({ stats }) {
  const statItems = [
    { label: "Images Processed", value: stats.totalScans },
    { label: "Barcodes Found", value: stats.barcodeCount },
    { label: "India Products", value: stats.indiaProducts },
    { label: "Samsung Products", value: stats.samsungProducts },
  ];

  return (
    <div className={styles.statsBar}>
      {statItems.map((stat, index) => (
        <div key={index} className={styles.statCard}>
          <div className={styles.statValue}>{stat.value}</div>
          <div className={styles.statLabel}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

export default StatsBar;