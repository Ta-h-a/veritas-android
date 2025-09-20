"""
Flask Blueprint for Text Extraction using Pytesseract OCR
Samsung Electronics India - Sticker Text Recognition
"""

import os
import io
import base64
from datetime import datetime
from flask import Blueprint, request, render_template, jsonify, current_app
from werkzeug.utils import secure_filename
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract

# Create blueprint
pytesseract_bp = Blueprint('pytesseract', __name__, url_prefix='/ocr/pytesseract')

# Configure allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image_for_ocr(image):
    """
    Preprocess image for better OCR results
    """
    try:
        # Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.5)
        
        # Apply slight blur to reduce noise
        image = image.filter(ImageFilter.MedianFilter(size=3))
        
        return image
    
    except Exception as e:
        current_app.logger.error(f"Image preprocessing error: {str(e)}")
        return image

def extract_text_pytesseract(image, config_options=None):
    """
    Extract text from image using Pytesseract with various configurations
    """
    results = {}
    
    # Default Tesseract config
    default_config = '--oem 3 --psm 6'
    if config_options:
        default_config = config_options
    
    try:
        # Basic text extraction
        text = pytesseract.image_to_string(image, config=default_config)
        results['basic_text'] = text.strip()
        
        # Get detailed data (confidence, word positions)
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, config=default_config)
        
        # Extract words with confidence scores
        words_with_confidence = []
        for i in range(len(data['text'])):
            if int(data['conf'][i]) > 0:  # Only include confident predictions
                word_info = {
                    'text': data['text'][i],
                    'confidence': int(data['conf'][i]),
                    'left': data['left'][i],
                    'top': data['top'][i],
                    'width': data['width'][i],
                    'height': data['height'][i]
                }
                words_with_confidence.append(word_info)
        
        results['detailed_words'] = words_with_confidence
        
        # Try different PSM modes for better results
        psm_modes = [
            ('Auto OSD', '--oem 3 --psm 1'),
            ('Single Block', '--oem 3 --psm 6'),
            ('Single Line', '--oem 3 --psm 7'),
            ('Single Word', '--oem 3 --psm 8'),
            ('Single Character', '--oem 3 --psm 10')
        ]
        
        psm_results = {}
        for mode_name, config in psm_modes:
            try:
                mode_text = pytesseract.image_to_string(image, config=config).strip()
                if mode_text:
                    psm_results[mode_name] = mode_text
            except Exception as e:
                psm_results[mode_name] = f"Error: {str(e)}"
        
        results['psm_variations'] = psm_results
        
        # Calculate overall confidence
        if words_with_confidence:
            avg_confidence = sum(w['confidence'] for w in words_with_confidence) / len(words_with_confidence)
            results['average_confidence'] = round(avg_confidence, 2)
        else:
            results['average_confidence'] = 0
            
        # High confidence words only (>70%)
        high_conf_words = [w for w in words_with_confidence if w['confidence'] > 70]
        results['high_confidence_text'] = ' '.join([w['text'] for w in high_conf_words])
        
        return results
        
    except Exception as e:
        current_app.logger.error(f"Pytesseract OCR error: {str(e)}")
        return {
            'error': str(e),
            'basic_text': '',
            'detailed_words': [],
            'psm_variations': {},
            'average_confidence': 0,
            'high_confidence_text': ''
        }

@pytesseract_bp.route('/')
def index():
    """Main Pytesseract OCR interface"""
    return render_template('ocr/pytesseract_interface.html')

@pytesseract_bp.route('/upload', methods=['POST'])
def upload_and_extract():
    """Handle image upload and perform OCR"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP'}), 400
        
        # Read image
        image = Image.open(file.stream)
        
        # Get original image info
        original_size = image.size
        original_mode = image.mode
        
        # Preprocess image
        processed_image = preprocess_image_for_ocr(image.copy())
        
        # Get custom config from request
        custom_config = request.form.get('tesseract_config', '--oem 3 --psm 6')
        
        # Extract text using Pytesseract
        ocr_results = extract_text_pytesseract(processed_image, custom_config)
        
        # Convert images to base64 for display
        def image_to_base64(img):
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            return f"data:image/png;base64,{img_str}"
        
        response_data = {
            'success': True,
            'filename': secure_filename(file.filename),
            'timestamp': datetime.now().isoformat(),
            'image_info': {
                'original_size': original_size,
                'original_mode': original_mode,
                'processed_size': processed_image.size
            },
            'ocr_results': ocr_results,
            'images': {
                'original': image_to_base64(image),
                'processed': image_to_base64(processed_image)
            },
            'tesseract_config': custom_config
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        current_app.logger.error(f"Upload and extract error: {str(e)}")
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@pytesseract_bp.route('/extract_from_base64', methods=['POST'])
def extract_from_base64():
    """Extract text from base64 encoded image"""
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = data['image']
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Preprocess image
        processed_image = preprocess_image_for_ocr(image)
        
        # Get custom config
        custom_config = data.get('tesseract_config', '--oem 3 --psm 6')
        
        # Extract text
        ocr_results = extract_text_pytesseract(processed_image, custom_config)
        
        response_data = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'ocr_results': ocr_results,
            'tesseract_config': custom_config
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        current_app.logger.error(f"Base64 extract error: {str(e)}")
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@pytesseract_bp.route('/health')
def health_check():
    """Check if Pytesseract is properly installed and accessible"""
    try:
        # Try to get Tesseract version
        version = pytesseract.get_tesseract_version()
        
        # Create a simple test image
        test_image = Image.new('RGB', (200, 50), color='white')
        
        # Try basic OCR
        test_text = pytesseract.image_to_string(test_image)
        
        return jsonify({
            'status': 'healthy',
            'tesseract_version': str(version),
            'test_result': 'success',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@pytesseract_bp.route('/languages')
def get_languages():
    """Get available Tesseract languages"""
    try:
        languages = pytesseract.get_languages()
        return jsonify({
            'available_languages': languages,
            'default_language': 'eng',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500