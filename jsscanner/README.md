# Samsung Electronics Barcode Scanner and OCR Application

A comprehensive Flask-based web application designed for Samsung Electronics India that provides multiple barcode scanning interfaces and advanced OCR (Optical Character Recognition) capabilities for text extraction from images.

## Project Overview

This application serves as a multi-purpose scanning solution featuring:

- Multiple barcode scanning interfaces using different JavaScript libraries (Quagga.js, ZXing)
- Advanced OCR text extraction using both Pytesseract and OpenCV
- Priority-based barcode scanning optimized for Samsung products in the Indian market
- Real-time camera-based scanning and static image processing
- Mobile-optimized and desktop interfaces

## Features

### Barcode Scanning Capabilities

- **Live Camera Scanning**: Real-time barcode detection using device cameras
- **Static Image Scanning**: Upload and process barcode images
- **Multi-format Support**: EAN-13, Code-128, QR codes, Data Matrix, ITF-14, UPC-A
- **Priority System**: Optimized for Samsung India products with 890 EAN-13 prefix
- **Mobile and Desktop Interfaces**: Responsive design for all devices

### OCR Text Extraction

- **Pytesseract Integration**: Advanced text recognition with multiple processing modes
- **OpenCV Processing**: Computer vision-based image preprocessing for better OCR accuracy
- **Multiple Image Formats**: Support for PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP
- **Confidence Scoring**: Text extraction with confidence levels and quality metrics
- **Image Preprocessing**: Automatic image enhancement for optimal text recognition

### Web Interfaces

- **Main Scanner Interface** (`/interface`) - Quagga.js live camera scanner
- **Priority Scanner** (`/priority`) - Samsung-optimized tier-based scanning
- **Code-128 Scanner** (`/code128`) - Specialized scanner for Code-128 barcodes
- **ZXing Scanners** (`/zxing`, `/zxing/mobile`) - Professional multi-format scanners
- **Static Scanners** (`/static/quagga`, `/static/zxing`) - Image upload scanners
- **OCR Interfaces** (`/ocr/pytesseract/`, `/ocr/opencv/`) - Text extraction tools

## Prerequisites

### System Requirements

- Python 3.8 or higher
- Tesseract OCR engine (for Pytesseract functionality)
- Modern web browser with camera access support
- Minimum 4GB RAM recommended for image processing

### Installing Tesseract OCR

#### Windows

1. Download Tesseract installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to default location (usually `C:\Program Files\Tesseract-OCR\`)
3. Add Tesseract to your system PATH environment variable

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install tesseract-ocr
sudo apt install libtesseract-dev
```

#### macOS

```bash
brew install tesseract
```

## Installation and Setup

### 1. Clone or Navigate to the Project Directory

```bash
cd /path/to/jsscanner
```

### 2. Create a Virtual Environment (Recommended)

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

### 3. Install Required Dependencies

```bash
pip install -r requirements_ocr.txt
```

### 4. Verify Tesseract Installation

```bash
tesseract --version
```

### 5. Create Upload Directory (if needed)

The application will automatically create an `uploads` directory, but you can create it manually:

```bash
mkdir uploads
```

## Running the Application

### Development Mode

```bash
python app.py
```

The application will start on `http://0.0.0.0:5005` and be accessible from:

- Local: `http://localhost:5005`
- Network: `http://[your-ip]:5005`

### Production Deployment

For production deployment, consider using a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5005 app:app
```

## Application Routes and Usage

### Barcode Scanning Routes

#### Main Scanner Interface

- **URL**: `/interface`
- **Description**: Primary barcode scanner with live camera feed using Quagga.js
- **Features**: Real-time detection, multiple format support, responsive design

#### Priority Scanner

- **URL**: `/priority`
- **Description**: Samsung-optimized scanner with tier-based priority system
- **Features**: EAN-13 with 890 prefix prioritization, Indian market optimization

#### Code-128 Specialized Scanner

- **URL**: `/code128`
- **Description**: Dedicated scanner for Code-128 barcodes
- **Use Case**: Serial numbers, internal tracking, supply chain management

#### ZXing Professional Scanner

- **URL**: `/zxing`
- **Description**: Desktop-optimized ZXing scanner for professional use
- **Features**: Multi-format support, high accuracy, enterprise features

#### ZXing Mobile Scanner

- **URL**: `/zxing/mobile`
- **Description**: Mobile-optimized ZXing scanner
- **Features**: Touch-friendly interface, camera optimization, responsive design

#### Static Image Scanners

- **URL**: `/static/quagga` - Quagga.js-based static image scanner
- **URL**: `/static/zxing` - ZXing-based static image scanner
- **Features**: Upload and process barcode images, batch processing support

### OCR Text Extraction Routes

#### Pytesseract OCR Interface

- **URL**: `/ocr/pytesseract/`
- **Description**: Main OCR interface using Pytesseract engine
- **Features**: Multiple processing modes, confidence scoring, detailed analysis

#### Pytesseract API Endpoints

- **Upload**: `POST /ocr/pytesseract/upload`
- **Base64**: `POST /ocr/pytesseract/extract_from_base64`
- **Health Check**: `GET /ocr/pytesseract/health`
- **Languages**: `GET /ocr/pytesseract/languages`

#### OpenCV OCR Interface

- **URL**: `/ocr/opencv/`
- **Description**: Computer vision-based OCR with advanced preprocessing
- **Features**: Multiple preprocessing stages, text region detection, enhanced accuracy

#### OpenCV API Endpoints

- **Upload**: `POST /ocr/opencv/upload`
- **Base64**: `POST /ocr/opencv/extract_from_base64`
- **Health Check**: `GET /ocr/opencv/health`
- **Options**: `GET /ocr/opencv/processing_options`

## API Usage Examples

### OCR Text Extraction via API

#### Upload Image for OCR (Pytesseract)

```bash
curl -X POST -F "file=@image.jpg" http://localhost:5005/ocr/pytesseract/upload
```

#### Extract Text from Base64 Image

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,/9j/4AAQ...","tesseract_config":"--oem 3 --psm 6"}' \
  http://localhost:5005/ocr/pytesseract/extract_from_base64
```

#### Health Check

```bash
curl http://localhost:5005/ocr/pytesseract/health
```

## Configuration

### Application Settings

- **Upload Folder**: `uploads/` (automatically created)
- **Max File Size**: 16MB
- **Allowed File Types**: PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP
- **Default Port**: 5005
- **Host**: 0.0.0.0 (accessible from network)

### OCR Configuration

- **Pytesseract Config**: Default `--oem 3 --psm 6` (customizable via API)
- **Image Preprocessing**: Automatic enhancement for better recognition
- **Confidence Threshold**: Configurable per request
- **Language Support**: Multiple languages available (check `/ocr/pytesseract/languages`)

## Project Structure

```
jsscanner/
├── app.py                          # Main Flask application
├── requirements_ocr.txt            # Python dependencies
├── routes.json                     # API route documentation
├── samsung-barcode-scanner-app-guide.md  # Samsung-specific documentation
├── blueprints/                     # Flask blueprints
│   └── ocr/                        # OCR modules
│       ├── pytesseract_bp.py       # Pytesseract OCR blueprint
│       └── opencv_bp.py            # OpenCV OCR blueprint
├── templates/                      # HTML templates
│   ├── file.html                   # Main scanner interface
│   ├── order.html                  # Priority scanner
│   ├── code128_test.html           # Code-128 scanner
│   ├── ocr/                        # OCR interfaces
│   │   ├── pytesseract_interface.html
│   │   └── opencv_interface.html
│   ├── static/                     # Static image scanners
│   │   ├── quagga_static.html
│   │   └── zxing_static.html
│   └── zxing/                      # ZXing scanners
│       ├── samsung_scanner.html
│       └── mobile_scanner.html
└── images/                         # Sample test images
    ├── adapter.jpg
    ├── headphones.jpg
    ├── ipad-qr-croppedd.jpg
    └── ...
```

## Dependencies

### Core Dependencies

- **Flask** (≥3.0.0) - Web framework
- **Werkzeug** (≥3.0.0) - WSGI utilities
- **Pillow** (≥11.0.0) - Image processing
- **opencv-python** (≥4.10.0.84) - Computer vision
- **numpy** (≥1.26.4) - Numerical computing
- **pytesseract** (0.3.10) - OCR engine interface

### Optional Dependencies

- **scikit-image** (≥0.23.2) - Advanced image processing
- **matplotlib** (≥3.9.0) - Visualization and analysis

## Troubleshooting

### Common Issues

#### Tesseract Not Found Error

```
TesseractNotFoundError: tesseract is not installed or it's not in your PATH
```

**Solution**: Install Tesseract OCR and add it to your system PATH.

#### Camera Access Issues

- Ensure browser has camera permissions
- Use HTTPS in production for camera access
- Check camera availability and conflicts with other applications

#### Image Processing Errors

- Verify image file format is supported
- Check file size (max 16MB)
- Ensure image is not corrupted

#### Port Already in Use

```
OSError: [Errno 48] Address already in use
```

**Solution**: Change the port in `app.py` or stop the conflicting process.

### Performance Optimization

- Use smaller image sizes for faster processing
- Adjust Tesseract PSM modes based on text layout
- Enable image preprocessing for better OCR accuracy
- Use appropriate barcode scanner based on use case

## Samsung Electronics India Specific Features

This application is optimized for Samsung Electronics India with:

- **EAN-13 with 890 prefix validation** for Indian market products
- **Priority-based scanning system** (Tier 1, 2, 3) for Samsung devices
- **BIS compliance features** for device registration and tracking
- **Supply chain integration** with SSCC and GS1-128 support
- **Multi-language support** for Indian regional languages

For detailed Samsung-specific implementation guidelines, refer to `samsung-barcode-scanner-app-guide.md`.

## Contributing

When contributing to this project:

1. Follow Python PEP 8 style guidelines
2. Add appropriate error handling and logging
3. Update documentation for new features
4. Test OCR functionality with various image types
5. Ensure mobile responsiveness for new interfaces

## License

This project is developed for Samsung Electronics India. Please refer to your organization's licensing policies for usage and distribution guidelines.

## Support

For technical support and feature requests:

1. Check the troubleshooting section above
2. Review the routes.json file for API documentation
3. Test with sample images in the `images/` directory
4. Verify health check endpoints for service status

## Version History

- **Current**: Flask-based multi-interface scanner with OCR capabilities
- **Features**: Barcode scanning, OCR text extraction, Samsung optimization
- **Target**: Samsung Electronics India market requirements
