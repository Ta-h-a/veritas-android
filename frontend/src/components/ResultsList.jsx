import React from "react";
import ResultItem from "./ResultItem";
import styles from "./ResultsList.module.css";

function ResultsList({ results }) {
  return (
    <div className={styles.results}>
      <h3 className={styles.title}>
        📊 ZXing Analysis Results{" "}
        {results.length > 0 ? `(${results.length} barcodes found)` : ""}
      </h3>
      <div>
        {results.length === 0 && (
          <div className={styles.emptyState}>No images analyzed yet</div>
        )}

        {results.map((result, idx) => (
          <ResultItem key={idx} result={result} />
        ))}
      </div>
    </div>
  );
}

export default ResultsList;