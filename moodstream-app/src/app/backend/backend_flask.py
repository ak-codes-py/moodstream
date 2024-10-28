from flask import Flask, request, jsonify
import torch
from transformers import DetrImageProcessor, DetrForObjectDetection
from PIL import Image
import io

app = Flask(__name__)

# Load the fine-tuned model
model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-50", revision="no_timm")
model.load_state_dict(torch.load('emotion_recognition_model.pth'))
model.eval()

# Load the processor
processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50", revision="no_timm")

# Emotion mapping
emotion_map = {0: 'Angry', 1: 'Disgust', 2: 'Fear', 3: 'Happy', 4: 'Sad', 5: 'Surprise', 6: 'Neutral'}

@app.route('/predict-emotion', methods=['POST'])
def predict_emotion():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    # Get the image from the request
    image_file = request.files['file']
    image = Image.open(io.BytesIO(image_file.read())).convert("RGB")

    # Preprocess the image
    inputs = processor(images=image, return_tensors="pt")
    
    # Run the image through the model
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Assuming the model outputs a class for emotion, map it
    # You'll likely need to modify this based on your final model's output
    predicted_emotion_id = torch.argmax(outputs.logits, dim=1).item()
    predicted_emotion = emotion_map[predicted_emotion_id]

    return jsonify({"emotion": predicted_emotion})

if __name__ == '__main__':
    app.run(debug=True)
