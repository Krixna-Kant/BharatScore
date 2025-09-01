import React, { useState, useRef, useEffect } from 'react';
import useFaceMatching from '../hooks/useFaceMatching';

interface VerificationResult {
  message: string;
  type: 'success' | 'error' | 'info';
}

const AadhaarVerification: React.FC = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showFaceVerification, setShowFaceVerification] = useState<boolean>(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    isMatching,
    similarity,
    isReady,
    isLoading,
    error,
    confidence,
    captureReference,
    startFaceMatching,
    stopFaceMatching,
    clearReference,
    hasReference
  } = useFaceMatching(videoRef);

  console.log("AadhaarVerification component rendered", {
    showFaceVerification,
    isReady,
    isLoading,
    isMatching,
    hasReference
  });

  // Initialize webcam when face verification is shown
  useEffect(() => {
    console.log("useEffect triggered for showFaceVerification:", showFaceVerification);
    if (showFaceVerification) {
      console.log("Initializing webcam for face verification");
      initializeWebcam();
    } else {
      console.log("Stopping webcam as face verification is hidden");
      stopWebcam();
    }
    
    return () => {
      console.log("Cleaning up webcam on component unmount or dependency change");
      stopWebcam();
    };
  }, [showFaceVerification]);

  const initializeWebcam = async () => {
    console.log("Attempting to initialize webcam");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      console.log("Webcam access granted, setting up video element");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Video source set successfully");
      } else {
        console.error("Video ref is not available");
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setResult({
        message: 'Error accessing webcam: ' + err.message,
        type: 'error'
      });
    }
  };

  const stopWebcam = () => {
    console.log("Stopping webcam");
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      console.log(`Stopping ${tracks.length} media tracks`);
      tracks.forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
    }
  };

  const extractFaceFromAadhaar = async (imageUrl: string) => {
    console.log("Extracting face from Aadhaar image:", imageUrl);
    try {
      setFaceImage(imageUrl);
      
      // Create an image element to load the Aadhaar card
      const img = new Image();
      img.onload = async () => {
        console.log("Aadhaar image loaded, dimensions:", img.width, "x", img.height);
        
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            console.error("Could not get 2D context from canvas");
            return;
          }
          
          // Set canvas size to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image on canvas
          ctx.drawImage(img, 0, 0, img.width, img.height);
          console.log("Image drawn on canvas");
          
          // Convert to data URL and set as face image
          const faceDataUrl = canvas.toDataURL('image/jpeg');
          setFaceImage(faceDataUrl);
          console.log("Face image converted to data URL");
          
          // Set this as the reference for face matching
          const imgElement = new Image();
          imgElement.src = faceDataUrl;
          imgElement.onload = async () => {
            console.log("Processed face image loaded");
            
            // Create a temporary video element to simulate the reference capture
            const tempVideo = document.createElement('video');
            tempVideo.width = imgElement.width;
            tempVideo.height = imgElement.height;
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imgElement.width;
            tempCanvas.height = imgElement.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) {
              console.error("Could not get 2D context from temp canvas");
              return;
            }
            
            tempCtx.drawImage(imgElement, 0, 0);
            console.log("Temporary canvas created with face image");
            
            // Convert to blob and create a stream (simulate video)
            tempCanvas.toBlob(async (blob) => {
              if (!blob) {
                console.error("Failed to create blob from canvas");
                return;
              }
              
              console.log("Blob created from canvas, size:", blob.size);
              const stream = tempCanvas.captureStream();
              
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
                console.log("Temporary stream set as video source");
                
                // Wait a moment for the video to load
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Capture reference from the Aadhaar face
                console.log("Attempting to capture reference from Aadhaar face");
                const success = await captureReference();
                
                if (success) {
                  console.log("Reference face captured successfully");
                  setResult({
                    message: 'Face extracted from Aadhaar card. Please look at the camera for verification.',
                    type: 'success'
                  });
                  
                  // Start the webcam for live matching
                  console.log("Stopping temporary stream and starting webcam");
                  stopWebcam();
                  await initializeWebcam();
                  startFaceMatching();
                } else {
                  console.error("Failed to capture reference face");
                  setResult({
                    message: 'Failed to extract face from Aadhaar card.',
                    type: 'error'
                  });
                }
              }
            }, 'image/jpeg');
          };
        }
      };
      
      img.onerror = () => {
        console.error("Failed to load Aadhaar image");
      };
      
      img.src = imageUrl;
    } catch (err) {
      console.error("Error in extractFaceFromAadhaar:", err);
      setResult({
        message: 'Error extracting face: ' + err.message,
        type: 'error'
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed");
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("File selected:", file.name, file.type, file.size);

    setOcrLoading(true);
    setResult({ message: 'Uploading image...', type: 'info' });

    try {
      // First, create a URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      console.log("Created object URL for image:", imageUrl);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', 'eng');
      formData.append('apikey', 'K82469512788957'); // replace with a secure key
      formData.append('isOverlayRequired', 'false');

      console.log("Sending OCR request to API");
      const res = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      console.log("OCR API response status:", res.status);
      const data = await res.json();
      console.log("OCR API response data:", data);

      const parsedText = data?.ParsedResults?.[0]?.ParsedText || '';
      console.log("Extracted text length:", parsedText.length);

      if (!parsedText) {
        console.log("No text detected in image");
        setResult({
          message: 'No text detected. Try another image.',
          type: 'error',
        });
        setOcrLoading(false);
        return;
      }

      setExtractedText(parsedText);

      const aadhaarMatch = parsedText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
      console.log("Aadhaar number match result:", aadhaarMatch);
      
      if (aadhaarMatch) {
        const number = aadhaarMatch[0].replace(/\s/g, '');
        setAadhaarNumber(number);
        setResult({
          message: `Aadhaar number extracted: ${number}. Now extracting face for verification...`,
          type: 'success',
        });
        
        // Extract face from the Aadhaar card
        console.log("Proceeding to extract face from Aadhaar card");
        await extractFaceFromAadhaar(imageUrl);
        setShowFaceVerification(true);
      } else {
        console.log("Aadhaar number pattern not found in extracted text");
        setResult({
          message: 'Text extracted but Aadhaar number not found.',
          type: 'info',
        });
      }
    } catch (error: any) {
      console.error("Error in handleImageUpload:", error);
      setResult({
        message: `OCR error: ${error.message}`,
        type: 'error',
      });
    } finally {
      setOcrLoading(false);
      console.log("OCR processing completed");
    }
  };

  const handleBackToAadhaarUpload = () => {
    console.log("Returning to Aadhaar upload screen");
    setShowFaceVerification(false);
    stopFaceMatching();
    stopWebcam();
    clearReference();
  };

  // Add console logs to monitor the face matching state
  useEffect(() => {
    console.log("Face Matching State:", {
      isReady,
      isLoading,
      isMatching,
      similarity,
      confidence,
      error,
      hasReference
    });
    
    // If there's an error loading models, display it
    if (error && error.includes('Failed to load face models')) {
      console.error("Model loading error detected:", error);
      setModelsError(error);
    } else {
      setModelsError(null);
    }
  }, [isReady, isLoading, isMatching, similarity, confidence, error, hasReference]);

  // Log when video events occur
  const handleVideoLoadedMetadata = () => {
    console.log("Video metadata loaded");
    if (videoRef.current) {
      console.log("Video dimensions:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
    }
  };

  const handleVideoLoadStart = () => {
    console.log("Video loading started");
  };

  const handleVideoCanPlay = () => {
    console.log("Video can play");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      {!showFaceVerification ? (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <h1 className="text-3xl font-bold text-center text-gray-800">Aadhaar OCR Extractor</h1>
          <p className="text-center text-gray-600">
            Upload an Aadhaar card image to extract text.
          </p>

          <label
            htmlFor="file-upload"
            className="flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          >
            Upload Aadhaar Image
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              onChange={handleImageUpload}
              accept="image/png, image/jpeg"
              disabled={ocrLoading}
            />
          </label>

          {ocrLoading && (
            <p className="text-center text-gray-500">Extracting text...</p>
          )}

          {result && (
            <div
              className={`p-4 rounded-md ${
                result.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : result.type === 'info'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              <p className="font-medium">{result.message}</p>
            </div>
          )}

          {aadhaarNumber && (
            <p className="text-center text-lg font-semibold text-gray-800">
              Aadhaar Number: {aadhaarNumber}
            </p>
          )}

          {extractedText && (
            <div className="mt-4 p-3 bg-gray-50 border rounded-md h-40 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
              {extractedText}
            </div>
          )}

          {modelsError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-200">
              <p className="font-bold">Model Loading Error</p>
              <p className="text-sm">{modelsError}</p>
              <p className="text-sm mt-2">
                Please download the model files from{" "}
                <a 
                  href="https://github.com/justadudewhohacks/face-api.js/tree/master/weights" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline"
                >
                  https://github.com/justadudewhohacks/face-api.js/tree/master/weights
                </a>{" "}
                and place them in the <code>public/models</code> directory.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
            <p>This is a demo OCR extraction app using OCR.Space API.</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <h1 className="text-3xl font-bold text-center text-gray-800">Face Verification</h1>
          
          <div className="flex justify-between items-center">
            {faceImage && (
              <div className="w-1/2 pr-2">
                <p className="text-sm text-gray-600 mb-1">Aadhaar Photo</p>
                <img 
                  src={faceImage} 
                  alt="Extracted from Aadhaar" 
                  className="w-full h-auto border rounded"
                />
              </div>
            )}
            
            <div className="w-1/2 pl-2">
              <p className="text-sm text-gray-600 mb-1">Live Camera</p>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-auto border rounded"
                onLoadedMetadata={handleVideoLoadedMetadata}
                onLoadStart={handleVideoLoadStart}
                onCanPlay={handleVideoCanPlay}
              />
            </div>
          </div>
          
          <div className="text-center">
            {isLoading && <p className="text-gray-500">Loading face recognition models...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            
            {isReady && (
              <>
                <div className="my-4">
                  <p className={`text-lg font-semibold ${
                    isMatching ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isMatching ? 'Face Matched!' : 'Face Not Matched'}
                  </p>
                  <p className="text-gray-600">Similarity: {(similarity * 100).toFixed(2)}%</p>
                  <p className="text-gray-600">Confidence: {(confidence * 100).toFixed(2)}%</p>
                </div>
                
                {isMatching && (
                  <div className="bg-green-100 p-4 rounded-md border border-green-200">
                    <p className="text-green-700 font-medium">
                      Verification successful! Your face matches the Aadhaar card.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <button
            onClick={handleBackToAadhaarUpload}
            className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Aadhaar Upload
          </button>
        </div>
      )}
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default AadhaarVerification;