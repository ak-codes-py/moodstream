"use client";

import { useState, useEffect, useRef } from 'react';

export default function EmotionRecognition() {
  const [emotion, setEmotion] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Access the user's webcam
    async function getWebcamStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    }
    getWebcamStream();
  }, []);

  const captureImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set the canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas content to a blob (image format)
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');

      // Send the image to Flask backend
      const response = await fetch('http://localhost:5000/predict-emotion', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setEmotion(data.emotion);
    }, 'image/jpeg');
  };

  return (
    <div>
      <h1>Real-Time Emotion Recognition</h1>
      <video ref={videoRef} autoPlay playsInline width="320" height="240"></video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <button onClick={captureImage}>Capture Emotion</button>
      {emotion && <p>Predicted Emotion: {emotion}</p>}
    </div>
  );
}
