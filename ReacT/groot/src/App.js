import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import * as tmImage from '@teachablemachine/image';

function App() {
  const webcamRef = useRef(null);
  const [label, setLabel] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [model, setModel] = useState(null);
  const [webcam, setWebcam] = useState(null);

  const startWebcam = async () => {
    if (webcam) {
      await webcam.stop();
      setWebcam(null);
      setLabel('');
    }
    init();
  };

  const init = async () => {
    const URL = "http://localhost:8000/my_model/";
    const modelURL = `${URL}model.json`;
    const metadataURL = `${URL}metadata.json`;

    try {
      const loadedModel = await tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);

      const webcamElement = new tmImage.Webcam(200, 200, true);
      await webcamElement.setup();
      await webcamElement.play();
      setWebcam(webcamElement);

      webcamRef.current.innerHTML = ''; // Clear previous webcam if any
      webcamRef.current.appendChild(webcamElement.canvas);

      const loop = async () => {
        if (isPredicting) {
          webcam.update();
          const predictions = await loadedModel.predict(webcam.canvas);
          const bestPrediction = predictions.reduce((highest, p) => p.probability > highest.probability ? p : highest, predictions[0]);
          setLabel(`${bestPrediction.className}: ${bestPrediction.probability.toFixed(2)}`);
        }
        requestAnimationFrame(loop);
      };

      setIsPredicting(true);
      setTimeout(() => {
        setIsPredicting(false);
        if (webcam) {
          webcam.stop(); // Stop webcam after 5 seconds if it's defined
        }
      }, 5000);
      loop();
    } catch (error) {
      console.error("Error during initialization:", error);
      setLabel('Error initializing webcam or model.');
    }
  };

  useEffect(() => {
    return () => {
      if (webcam) {
        webcam.stop(); // Cleanup only if webcam is defined
      }
    };
  }, [webcam]);

  return (
    <div className="page">
      <h1>Plant Disease Classification</h1>
      <button onClick={startWebcam}>Start</button>
      <div id="webcam-container" ref={webcamRef}></div>
      <div id="label-container">{label}</div>
    </div>
  );
}

export default App;
