const { createWorker } = require('tesseract.js');

// Function to extract text from an image using Tesseract.js
async function extractTextFromImage(imageBuffer) {
  try {
    // Create a Tesseract worker with English language
    const worker = await createWorker('eng');
    
    // Recognize text from the image buffer
    const result = await worker.recognize(imageBuffer);
    
    // Terminate the worker to free up resources
    await worker.terminate();
    
    // Return the extracted text
    return {
      success: true,
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    console.error('Error extracting text:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Route handler for text extraction
async function handleTextExtraction(req, res) {
  try {
    // Check if an image file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Extract text from the uploaded image
    const result = await extractTextFromImage(req.file.buffer);
    
    if (result.success) {
      res.json({
        success: true,
        text: result.text,
        confidence: result.confidence,
        message: 'Text extracted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to extract text from image',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in text extraction route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  extractTextFromImage,
  handleTextExtraction
};