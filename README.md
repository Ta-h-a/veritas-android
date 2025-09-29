# Veritas Android - Comprehensive Barcode Scanning & OCR Platform

![Team](https://img.shields.io/badge/Team-DexVeritas-red)
![Hackathon](https://img.shields.io/badge/Hackathon-Samsung%20PRISM%202025-blue)
![Veritas Android](https://img.shields.io/badge/Platform-Multi--Platform-neon)

## Overview

Veritas Android is a comprehensive multi-platform solution for barcode scanning, optical character recognition (OCR), and product verification. The platform combines advanced scanning technologies with secure data management, providing end-to-end solutions for retail, manufacturing, supply chain, and administrative workflows.

## Key Features

### Core Capabilities

- **Multi-Format Barcode Scanning**: Support for EAN-13, Code-128, QR Code, Data Matrix, UPC-A/E, Code-39, PDF417, and ITF-14
- **Advanced OCR Processing**: Tesseract and OpenCV-based text extraction with confidence scoring
- **Real-time Analysis**: Simultaneous barcode detection and text extraction
- **Secure Authentication**: Clerk-based user management with role-based access control
- **Location Management**: Comprehensive Indian state and city selection
- **Category Classification**: Product workflow categorization and tracking

### Platform Components

- **Web Frontend**: React-based responsive interface with modern UI/UX
- **Mobile App**: React Native cross-platform mobile application
- **Admin Dashboard**: Administrative panel for user and data management
- **Backend API**: Node.js/Express server with MongoDB integration
- **Flask Scanner**: Python-based OCR and specialized scanning interfaces

## Architecture

The Veritas platform consists of multiple interconnected modules:

```
veritas-android/
├── frontend/          # React web application
├── admin/             # Admin dashboard (React + Vite)
├── backend/           # Node.js API server
├── react-native/      # Cross-platform mobile app
├── jsscanner/         # Flask-based OCR and scanning
└── api/               # Additional API services
```

## Module Documentation

### Frontend Applications

- **[Frontend Web App](./frontend/README.md)** - Main React web application for barcode scanning and OCR
- **[Admin Dashboard](./admin/README.md)** - Administrative interface built with React and TailwindCSS
- **[React Native App](./react-native/docs/api.md)** - Cross-platform mobile application with API documentation

### Backend Services

- **[Backend API](./backend/README.md)** - Node.js server with MongoDB, and Tesseract OCR
- **[JavaScript Scanner](./jsscanner/README.md)** - Flask-based OCR application with multiple scanning interfaces

### Specialized Documentation

- **[Samsung Scanner Guide](./jsscanner/samsung-barcode-scanner-app-guide.md)** - Samsung Electronics India-specific implementation guide

## Technology Stack

### Frontend Technologies

- **React 19.1.1** with Vite build system
- **TailwindCSS 4.1.13** for styling
- **Clerk Authentication** for user management
- **ZXing Library** for barcode scanning
- **Lucide React** for icons

### Backend Technologies

- **Node.js** with Express framework
- **MongoDB** with Mongoose ODM and encryption
- **Tesseract.js** for OCR processing
- **Flask** for Python-based OCR services

### Mobile Technologies

- **React Native** for cross-platform development
- **JWT Authentication** for secure API access
- **Native camera integration** for scanning

## Quick Start

### Prerequisites

- Node.js 16.0+
- Python 3.8+
- MongoDB 5.0+
- Tesseract OCR engine
- Android Studio (for application development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ta-h-a/veritas-android.git
   cd veritas-android
   ```

2. **Set up Backend Services**

   ```bash
   # Backend API
   cd backend
   npm install
   cp .env.example .env  # Configure your environment
   node index.js

   # Flask Scanner (separate terminal)
   cd ../jsscanner
   pip install -r requirements_ocr.txt
   python app.py
   ```

3. **Set up Frontend Applications**

   ```bash
   # Main Web App
   cd frontend
   npm install
   npm run dev

   # Admin Dashboard (separate terminal)
   cd ../admin
   npm install
   npm run dev
   ```

4. **Set up Mobile App**
   ```bash
   cd react-native
   npm install
   # Follow React Native setup guide for iOS/Android
   ```

### Default Ports

- Frontend Web App: `http://localhost:5173`
- Admin Dashboard: `http://localhost:5174`
- Backend API: `http://localhost:8080`
- Flask Scanner: `http://localhost:5005`

## Environment Configuration

**Backend (.env)**

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
```

**Frontend (.env)**

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:8080
```

**Admin (.env)**

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:8080
```

## Supported Platforms

- **Web Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Devices**: iOS 12+, Android 6.0+
- **Desktop**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

## Use Cases

### Retail & E-commerce

- Product verification and authenticity checking
- Inventory management and tracking
- Point-of-sale integration
- Customer service and support

### Manufacturing & Supply Chain

- Quality control and asset tracking
- Warehouse and distribution management
- Supply chain visibility and logistics
- Procurement and vendor management

### Enterprise & Admin

- User management and access control
- Data analytics and reporting
- System monitoring and maintenance
- Compliance and audit trails

## Security Features

- **Data Encryption**: Mongoose encryption for sensitive database records
- **Secure Authentication**: Clerk-based user management with JWT tokens
- **API Security**: CORS protection and input validation
- **Role-based Access**: Granular permissions for different user types

## Performance Metrics

- **Scan Speed**: <2 seconds per barcode
- **OCR Accuracy**: >95% for clear text images
- **API Response**: <500ms average response time
- **Uptime**: 99.9% availability target
- **Storage**: Scalable cloud storage with MEGA integration

## Contributing

We welcome contributions to the Veritas platform! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the existing code style and conventions
4. Add tests for new functionality
5. Update documentation as needed
6. Commit changes (`git commit -m 'Add some AmazingFeature'`)
7. Push to branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

### Development Guidelines

- Follow React and Node.js best practices
- Use TypeScript where applicable
- Implement comprehensive error handling
- Ensure mobile responsiveness
- Write clear, maintainable code
- Add appropriate comments and documentation

## Support

For technical support and questions:

- **Issues**: Open a GitHub issue for bug reports and feature requests
- **Documentation**: Refer to module-specific README files for detailed setup
- **Contact**: Development team via repository discussions

---

**Built with ❤️ for Samsung Electronics India and the global supply chain community.**

_Last updated: September 29, 2025_
