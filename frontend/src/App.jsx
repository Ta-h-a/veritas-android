import React from "react";
import { useBarcodeScanner } from "./hooks";
import { Header, StatsBar, ImageUploader, ResultsList } from "./components";
import "./styles/global.css";
import "./styles/utilities.css"

function App() {
  const {
    uploadedImage,
    results,
    status,
    processing,
    stats,
    processFile,
    scanImage,
    clearResults,
  } = useBarcodeScanner();

  return (
    <div className="container">
      <Header />
      <StatsBar stats={stats} />
      <ImageUploader
        uploadedImage={uploadedImage}
        onFileProcess={processFile}
        onScan={scanImage}
        onClear={clearResults}
        processing={processing}
        status={status}
      />
      <ResultsList results={results} />
    </div>
  );
}

export default App;
