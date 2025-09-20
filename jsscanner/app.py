from flask import Flask, request, jsonify, render_template
import os

# Import OCR blueprints
from blueprints.ocr.pytesseract_bp import pytesseract_bp
from blueprints.ocr.opencv_bp import opencv_bp

# Samsung Electronics India Barcode Scanner Application
app = Flask(__name__)

# Configure upload folder
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Register OCR blueprints
app.register_blueprint(pytesseract_bp)
app.register_blueprint(opencv_bp)

@app.route('/interface',methods=['GET'])
def interface():
    return render_template('file.html')

@app.route('/priority',methods=['GET'])
def priority():# renders the html file with optimization for barcode priority
    try:
        return render_template('order.html')
    except Exception as e:
        return f"Template error: {str(e)}", 500

@app.route('/code128',methods=['GET'])
def code128():
    return render_template('code128_test.html')

@app.route('/zxing',methods=['GET'])
def zxing():
    return render_template('zxing/samsung_scanner.html')

@app.route('/zxing/mobile',methods=['GET'])
def zxing_mobile():
    return render_template('zxing/mobile_scanner.html')

@app.route('/static/quagga',methods=['GET'])
def static_quagga():
    return render_template('static/quagga_static.html')

@app.route('/static/zxing',methods=['GET'])
def static_zxing():
    return render_template('static/zxing_static.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=5005)