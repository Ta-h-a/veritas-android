export const BARCODE_PRIORITIES = {
  EAN_13: { tier: 1, priority: "ESSENTIAL", name: "EAN-13" },
  CODE_128: { tier: 1, priority: "ESSENTIAL", name: "Code-128" },
  QR_CODE: { tier: 2, priority: "IMPORTANT", name: "QR Code" },
  DATA_MATRIX: { tier: 2, priority: "IMPORTANT", name: "Data Matrix" },
  PDF_417: { tier: 2, priority: "IMPORTANT", name: "PDF417" },
  UPC_A: { tier: 3, priority: "ADDITIONAL", name: "UPC-A" },
  UPC_E: { tier: 3, priority: "ADDITIONAL", name: "UPC-E" },
  ITF: { tier: 3, priority: "ADDITIONAL", name: "ITF-14" },
  CODE_39: { tier: 3, priority: "ADDITIONAL", name: "Code-39" },
  CODABAR: { tier: 3, priority: "ADDITIONAL", name: "Codabar" },
};