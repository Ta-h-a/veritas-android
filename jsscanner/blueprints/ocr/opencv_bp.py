"""
Flask Blueprint for Text Extraction using OpenCV + OCR
Samsung Electronics India - Sticker Text Recognition with Computer Vision
"""

import os
import io
import base64
import numpy as np
from datetime import datetime
from flask import Blueprint, request, render_template, jsonify, current_app
from werkzeug.utils import secure_filename
from PIL import Image
import cv2

# Create blueprint
opencv_bp = Blueprint('opencv_ocr', __name__, url_prefix='/ocr/opencv')

# Configure allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def pil_to_opencv(pil_image):
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

def opencv_to_pil(opencv_image):
    return Image.fromarray(cv2.cvtColor(opencv_image, cv2.COLOR_BGR2RGB))

def preprocess_with_opencv(image):
    """
    Advanced image preprocessing using OpenCV for better text extraction
    """
    results = {}
    
    try:
        # Convert PIL to OpenCV
        cv_image = pil_to_opencv(image)
        original = cv_image.copy()
        
        # Convert to grayscale
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        results['grayscale'] = opencv_to_pil(cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR))
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        results['blurred'] = opencv_to_pil(cv2.cvtColor(blurred, cv2.COLOR_GRAY2BGR))
        
        # Apply threshold (binary)
        _, thresh_binary = cv2.threshold(blurred, 127, 255, cv2.THRESH_BINARY)
        results['binary_threshold'] = opencv_to_pil(cv2.cvtColor(thresh_binary, cv2.COLOR_GRAY2BGR))
        
        # Adaptive threshold
        adaptive_thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        results['adaptive_threshold'] = opencv_to_pil(cv2.cvtColor(adaptive_thresh, cv2.COLOR_GRAY2BGR))
        
        # Otsu's threshold
        _, otsu_thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        results['otsu_threshold'] = opencv_to_pil(cv2.cvtColor(otsu_thresh, cv2.COLOR_GRAY2BGR))
        
        # Morphological operations
        kernel = np.ones((3, 3), np.uint8)
        
        # Opening (erosion followed by dilation)
        opening = cv2.morphologyEx(otsu_thresh, cv2.MORPH_OPEN, kernel, iterations=1)
        results['morphology_opening'] = opencv_to_pil(cv2.cvtColor(opening, cv2.COLOR_GRAY2BGR))
        
        # Closing (dilation followed by erosion)
        closing = cv2.morphologyEx(otsu_thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
        results['morphology_closing'] = opencv_to_pil(cv2.cvtColor(closing, cv2.COLOR_GRAY2BGR))
        
        # Edge detection using Canny
        edges = cv2.Canny(blurred, 50, 150, apertureSize=3)
        results['canny_edges'] = opencv_to_pil(cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR))
        
        # Sharpen the image
        kernel_sharpen = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(gray, -1, kernel_sharpen)
        results['sharpened'] = opencv_to_pil(cv2.cvtColor(sharpened, cv2.COLOR_GRAY2BGR))
        
        # Contrast enhancement using CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        clahe_enhanced = clahe.apply(gray)
        results['clahe_enhanced'] = opencv_to_pil(cv2.cvtColor(clahe_enhanced, cv2.COLOR_GRAY2BGR))
        
        # Best processed image for OCR (combination of techniques)
        best_processed = cv2.GaussianBlur(clahe_enhanced, (3, 3), 0)
        _, best_processed = cv2.threshold(best_processed, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Slight dilation to connect broken text
        kernel_small = np.ones((2, 2), np.uint8)
        best_processed = cv2.morphologyEx(best_processed, cv2.MORPH_CLOSE, kernel_small)
        
        results['best_processed'] = opencv_to_pil(cv2.cvtColor(best_processed, cv2.COLOR_GRAY2BGR))
        results['best_processed_cv'] = best_processed  # Keep OpenCV format for further processing
        
        return results
        
    except Exception as e:
        current_app.logger.error(f"OpenCV preprocessing error: {str(e)}")
        return {'error': str(e)}

def detect_text_regions(cv_image):
    """
    Detect text regions using OpenCV's text detection methods
    """
    try:
        text_regions = []
        
        # Convert to grayscale if needed
        if len(cv_image.shape) == 3:
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = cv_image
            
        # Find contours
        contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours that might contain text
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            area = cv2.contourArea(contour)
            
            # Filter based on size and aspect ratio
            if area > 100 and w > 10 and h > 10:
                aspect_ratio = w / h
                if 0.05 < aspect_ratio < 10:  # Reasonable aspect ratio for text
                    text_regions.append({
                        'x': int(x),
                        'y': int(y),
                        'width': int(w),
                        'height': int(h),
                        'area': int(area),
                        'aspect_ratio': round(aspect_ratio, 2)
                    })
        
        return sorted(text_regions, key=lambda r: r['area'], reverse=True)
        
    except Exception as e:
        current_app.logger.error(f"Text region detection error: {str(e)}")
        return []

def extract_text_opencv(image):
    """
    Extract text using OpenCV preprocessing + simple OCR simulation
    Since we don't have tesseract here, we'll focus on preprocessing
    """
    results = {}
    
    try:
        # Get preprocessing results
        preprocessing_results = preprocess_with_opencv(image)
        
        if 'error' in preprocessing_results:
            return {'error': preprocessing_results['error']}
        
        # Get the best processed image
        best_cv_image = preprocessing_results['best_processed_cv']
        
        # Detect text regions
        text_regions = detect_text_regions(best_cv_image)
        
        # Get image statistics
        height, width = best_cv_image.shape
        white_pixels = np.sum(best_cv_image == 255)
        black_pixels = np.sum(best_cv_image == 0)
        
        results = {
            'preprocessing_stages': {k: v for k, v in preprocessing_results.items() if k != 'best_processed_cv'},
            'text_regions': text_regions,
            'image_stats': {
                'dimensions': f"{width}x{height}",
                'white_pixels': int(white_pixels),
                'black_pixels': int(black_pixels),
                'white_percentage': round((white_pixels / (width * height)) * 100, 2),
                'total_regions': len(text_regions)
            },
            'processing_info': {
                'techniques_applied': [
                    'Grayscale conversion',
                    'Gaussian blur noise reduction',
                    'Multiple thresholding methods',
                    'CLAHE contrast enhancement',
                    'Morphological operations',
                    'Edge detection',
                    'Image sharpening',
                    'Text region detection'
                ],
                'recommended_for_ocr': 'best_processed'
            }
        }
        
        # If pytesseract is available, try to use it
        try:
            import pytesseract
            
            # Convert back to PIL for pytesseract
            pil_image = opencv_to_pil(cv2.cvtColor(best_cv_image, cv2.COLOR_GRAY2BGR))
            
            # Extract text
            extracted_text = pytesseract.image_to_string(pil_image, config='--oem 3 --psm 6')
            results['extracted_text'] = extracted_text.strip()
            
            # Get confidence data
            data = pytesseract.image_to_data(pil_image, output_type=pytesseract.Output.DICT)
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            
            if confidences:
                results['ocr_confidence'] = {
                    'average': round(sum(confidences) / len(confidences), 2),
                    'max': max(confidences),
                    'min': min(confidences),
                    'word_count': len(confidences)
                }
            
        except ImportError:
            results['extracted_text'] = "Pytesseract not available - showing preprocessing results only"
            results['ocr_confidence'] = None
        
        return results
        
    except Exception as e:
        current_app.logger.error(f"OpenCV text extraction error: {str(e)}")
        return {'error': str(e)}

@opencv_bp.route('/')
def index():
    """Main OpenCV OCR interface"""
    return render_template('ocr/opencv_interface.html')

@opencv_bp.route('/upload', methods=['POST'])
def upload_and_extract():
    """Handle image upload and perform OpenCV processing"""
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
        
        # Extract text using OpenCV
        ocr_results = extract_text_opencv(image)
        
        # Convert all PIL images to base64
        def image_to_base64(img):
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            return f"data:image/png;base64,{img_str}"
        
        # Convert preprocessing images to base64
        preprocessing_images = {}
        if 'preprocessing_stages' in ocr_results:
            for stage_name, stage_image in ocr_results['preprocessing_stages'].items():
                if isinstance(stage_image, Image.Image):
                    preprocessing_images[stage_name] = image_to_base64(stage_image)
        
        response_data = {
            'success': True,
            'filename': secure_filename(file.filename),
            'timestamp': datetime.now().isoformat(),
            'image_info': {
                'original_size': original_size,
                'original_mode': original_mode
            },
            'ocr_results': {k: v for k, v in ocr_results.items() if k != 'preprocessing_stages'},
            'preprocessing_images': preprocessing_images,
            'original_image': image_to_base64(image)
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        current_app.logger.error(f"Upload and extract error: {str(e)}")
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@opencv_bp.route('/extract_from_base64', methods=['POST'])
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
        
        # Extract text using OpenCV
        ocr_results = extract_text_opencv(image)
        
        response_data = {
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'ocr_results': ocr_results
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        current_app.logger.error(f"Base64 extract error: {str(e)}")
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500

@opencv_bp.route('/health')
def health_check():
    """Check if OpenCV is properly installed and accessible"""
    try:
        # Check OpenCV version
        cv_version = cv2.__version__
        
        # Create a simple test image
        test_image = np.zeros((100, 200, 3), dtype=np.uint8)
        test_image.fill(255)  # White background
        
        # Try basic OpenCV operations
        gray = cv2.cvtColor(test_image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Check if pytesseract is also available
        pytesseract_available = False
        try:
            import pytesseract
            pytesseract_version = str(pytesseract.get_tesseract_version())
            pytesseract_available = True
        except ImportError:
            pytesseract_version = "Not installed"
        
        return jsonify({
            'status': 'healthy',
            'opencv_version': cv_version,
            'pytesseract_available': pytesseract_available,
            'pytesseract_version': pytesseract_version,
            'test_result': 'success',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@opencv_bp.route('/processing_options')
def get_processing_options():
    """Get available OpenCV processing options"""
    return jsonify({
        'preprocessing_techniques': [
            'Grayscale conversion',
            'Gaussian blur',
            'Binary threshold',
            'Adaptive threshold', 
            'Otsu threshold',
            'Morphological opening',
            'Morphological closing',
            'Canny edge detection',
            'Image sharpening',
            'CLAHE enhancement'
        ],
        'recommended_workflow': [
            'Load image',
            'Convert to grayscale',
            'Apply CLAHE enhancement',
            'Gaussian blur for noise reduction',
            'Otsu threshold for binarization',
            'Morphological closing for text connection',
            'Text region detection',
            'OCR processing'
        ],
        'timestamp': datetime.now().isoformat()
    })