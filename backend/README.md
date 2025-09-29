# Veritas Backend Server

This is the backend server for the Veritas Android project, built with Node.js, Express, and MongoDB. It provides APIs for data management, file storage, and OCR functionality.

## Features

- RESTful API endpoints for data management
- Secure file storage using MEGA
- OCR text extraction using Tesseract.js
- MongoDB database integration with encryption
- CORS enabled for cross-origin requests
- File upload handling with Multer
- Environment-based configuration

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v16.0.0 or higher)
- MongoDB (v5.0 or higher)
- Tesseract OCR engine (for OCR functionality)

## Project Setup

1. Clone the repository:

```bash
git clone https://github.com/Ta-h-a/veritas-android.git
cd veritas-android/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
MEGA_EMAIL=your_mega_account_email
MEGA_PASSWORD=your_mega_account_password
```

4. Start the server:

```bash
node index.js
```

## API Endpoints

### Clerk Data Management

#### POST `/api/clerkdata`

Adds new clerk data to the database.

```json
{
  "clerk_id": "string",
  "clerk_email": "string",
  "barcode_number": "string",
  "ocr_text": "string",
  "barcode_image": "string",
  "state": "string",
  "city": "string",
  "category": "string"
}
```

#### GET `/api/admin/clerkdata`

Retrieves all clerk data entries.

#### DELETE `/api/clerkdata/:id`

Deletes a specific clerk data entry by ID.

### File Management

#### POST `/api/upload`

Uploads an image file to MEGA storage.

- Request: multipart/form-data with 'image' field
- Returns: Public URL of the uploaded file

### Text Extraction

#### POST `/api/extract-text`

Extracts text from an uploaded image using Tesseract.js.

- Request: multipart/form-data with 'image' field
- Returns: Extracted text content

### Information Update

#### PUT `/api/update-info/:clerkId`

Updates category, state, and city information for a specific clerk.

```json
{
  "category": "string",
  "state": "string",
  "city": "string"
}
```

## Project Structure

```
backend/
├── models/             # Database models
│   └── ClerkData.js    # Clerk data schema and model
├── index.js            # Main server file
├── tesseractapi.js     # OCR functionality
├── package.json        # Project dependencies
├── .env                # Environment variables
└── README.md          # Project documentation
```

## Dependencies

### Core Dependencies

- **express**: v5.1.0 - Web framework
- **mongoose**: v8.18.2 - MongoDB ODM
- **megajs**: v1.3.9 - MEGA storage client
- **tesseract.js**: v5.1.1 - OCR engine
- **cors**: v2.8.5 - CORS middleware
- **multer**: v2.0.2 - File upload handling
- **dotenv**: v17.2.2 - Environment configuration
- **mongoose-encryption**: v2.1.2 - Data encryption

## Database Schema

The ClerkData model includes the following fields:

- clerk_id (String, required)
- clerk_email (String, required)
- barcode_number (String)
- ocr_text (String)
- barcode_image (String)
- state (String)
- city (String)
- category (String)

## Security Features

1. **Data Encryption**

   - Mongoose-encryption for sensitive data
   - Secure file storage with MEGA

2. **Input Validation**

   - Request body validation
   - File type checking
   - Error handling

3. **Environment Variables**
   - Sensitive credentials in .env
   - Configuration separation

## Error Handling

The API implements comprehensive error handling:

- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Server errors (500)

## Development Guide

1. **API Development**

   - Follow RESTful principles
   - Implement proper error handling
   - Use async/await for asynchronous operations

2. **Database Operations**

   - Use Mongoose for MongoDB interactions
   - Implement proper indexing
   - Handle connection errors

3. **File Operations**

   - Validate file types
   - Handle upload errors
   - Implement cleanup procedures

4. **Testing**
   - Test API endpoints
   - Validate data operations
   - Check error scenarios

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the development team.
