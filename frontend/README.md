# Dex Veritas - Barcode Scanner & OCR Application

Dex Veritas is a comprehensive web application for barcode scanning and optical character recognition (OCR) analysis. The application combines ZXing MultiFormatReader for barcode detection with Tesseract OCR for text extraction, providing a complete solution for product data capture and verification.

## Features

### Core Functionality

- **Multi-Format Barcode Scanning**: Supports EAN-13, Code-128, QR Code, Data Matrix, UPC-A/E, Code-39, PDF417, and ITF-14 formats
- **OCR Text Extraction**: Uses Tesseract OCR engine for extracting text from images
- **Image Upload**: Drag-and-drop or click-to-upload interface supporting JPG, PNG, WEBP, BMP, and GIF formats
- **Real-time Analysis**: Simultaneous barcode detection and text extraction
- **Data Submission**: Form-based data entry with location and category classification

### Advanced Features

- **User Authentication**: Clerk-based authentication system with user management
- **Location Management**: Comprehensive state and city selection for Indian locations
- **Category Classification**: Product workflow categorization (Manufacturing, Distribution, Quality Control, etc.)
- **Results Management**: Historical view of scanned barcodes and extracted text
- **Statistics Tracking**: Real-time statistics for scans, barcodes, and product classifications
- **Barcode Validation**: Special validation for Indian products (890 prefix) and Samsung products

### Technical Capabilities

- **ZXing Integration**: Browser-based barcode scanning using ZXing library
- **Tesseract OCR**: Server-side text extraction with confidence scoring
- **Modular Architecture**: Component-based React structure with custom hooks
- **Responsive Design**: CSS Modules for component-specific styling
- **Error Handling**: Comprehensive error states and user feedback

## Technology Stack

- **Frontend Framework**: React 19.1.1 with Vite build tool
- **Authentication**: Clerk React for user management
- **Barcode Scanning**: ZXing Library (@zxing/library)
- **UI Components**: Lucide React icons
- **Styling**: CSS Modules with utility classes
- **Development**: ESLint for code quality
- **Backend Communication**: RESTful API integration

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Application header with branding
│   ├── ImageUploader.jsx # File upload and form interface
│   ├── ResultsList.jsx # Results display container
│   ├── ResultItem.jsx  # Individual result component
│   └── StatsBar.jsx    # Statistics display
├── hooks/              # Custom React hooks
│   ├── useBarcodeScanner.js # ZXing barcode scanning logic
│   └── tesseracthook.js     # OCR text extraction logic
├── constants/          # Application constants
│   └── barCodePriorities.js # Barcode format priorities
├── utils/              # Utility functions
│   └── barcodeValidator.js  # Barcode validation logic
├── styles/             # Global styles
│   ├── global.css      # Global styling
│   └── utilities.css   # Utility classes
└── assets/             # Static assets
```

## Setup and Installation

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- Backend API server running on localhost:8080

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ta-h-a/veritas-android.git
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_BACKEND_URL=http://localhost:8080
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Access the application**
   Open http://localhost:5173 in your web browser

## Usage

### Basic Workflow

1. **Authentication**: Sign in using Clerk authentication
2. **Location Setup**: Select state, city, and category for your scanning session
3. **Image Upload**: Upload barcode images using drag-and-drop or file selection
4. **Analysis**: Click "Analyze" to run both barcode scanning and OCR extraction
5. **Review Results**: Review detected barcodes and extracted text in the form fields
6. **Submit Data**: Submit the processed data to the backend for storage

### Supported Locations

The application includes comprehensive coverage for major Indian states:

- Maharashtra (Mumbai, Pune, Nagpur, etc.)
- Karnataka (Bengaluru, Mysuru, Hubli, etc.)
- Andhra Pradesh (Visakhapatnam, Vijayawada, etc.)
- Telangana (Hyderabad, Warangal, etc.)
- Tamil Nadu (Chennai, Coimbatore, etc.)
- Gujarat (Ahmedabad, Surat, etc.)
- West Bengal (Kolkata, Howrah, etc.)
- New Delhi (Multiple districts)

### Product Categories

Available workflow categories include:

- Manufacturing and Production Planning
- Storage, Warehouse, and Distribution
- Research & Development
- Quality Control and Asset Tracking
- Supply Chain and Logistics Management
- Procurement and Vendor Management

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## API Integration

The application integrates with backend services for:

- **OCR Processing**: POST `/api/extract-text` for Tesseract OCR
- **Data Storage**: POST `/api/clerkdata` for saving scan results
- **User Management**: Clerk API for authentication

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code structure and naming conventions
2. Use CSS Modules for component styling
3. Implement proper error handling and user feedback
4. Test barcode scanning with various formats
5. Ensure responsive design compatibility

## License

This project is part of the Veritas Android suite for barcode scanning and product verification.
