import React, { useState, useCallback } from "react";
import { Upload, Camera, FileText, CheckCircle, XCircle, Loader } from "lucide-react";

interface AadhaarVerificationProps {
  onAadhaarExtracted?: (aadhaar: string, extractedData?: any) => void;
}

interface VerificationResult {
  message: string;
  type: "success" | "error" | "info" | "warning";
}

const AadhaarVerification: React.FC<AadhaarVerificationProps> = ({
  onAadhaarExtracted,
}) => {
  const [aadhaarNumber, setAadhaarNumber] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [extractedName, setExtractedName] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const extractPersonalInfo = (text: string) => {
    const info: any = {};
    
    // Extract name (usually appears after "Name:" or before "S/O" or "D/O")
    const nameMatch = text.match(/(?:Name[:\s]+)([A-Za-z\s]+?)(?:\n|\r|S\/O|D\/O|W\/O)/i);
    if (nameMatch) {
      info.name = nameMatch[1].trim();
      setExtractedName(info.name);
    }

    // Extract address
    const addressMatch = text.match(/(?:Address[:\s]+)([\s\S]+?)(?:PIN|Pin|Pincode)/i);
    if (addressMatch) {
      info.address = addressMatch[1].replace(/\n/g, " ").trim();
    }

    // Extract PIN code
    const pinMatch = text.match(/(?:PIN|Pin|Pincode)[:\s]*(\d{6})/i);
    if (pinMatch) {
      info.pincode = pinMatch[1];
    }

    return info;
  };

  const processOCRResult = useCallback(async (file: File) => {
    setOcrLoading(true);
    setResult({ message: "Processing Aadhaar card...", type: "info" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "eng");
      formData.append("apikey", "K82469512788957"); // Replace with secure API key
      formData.append("isOverlayRequired", "false");
      formData.append("detectOrientation", "true");
      formData.append("scale", "true");
      formData.append("isTable", "false");

      const res = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("OCR service unavailable");
      }

      const data = await res.json();
      
      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage || "OCR processing failed");
      }

      const parsedText = data?.ParsedResults?.[0]?.ParsedText || "";

      if (!parsedText || parsedText.trim().length < 50) {
        setResult({
          message: "Unable to extract text from image. Please ensure the Aadhaar card is clear and well-lit.",
          type: "error",
        });
        return;
      }

      setExtractedText(parsedText);

      // Extract Aadhaar number with multiple patterns
      const aadhaarPatterns = [
        /\b(\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g,
        /(?:UID|Aadhaar|आधार)[\s:]*(\d{4}[\s-]?\d{4}[\s-]?\d{4})/gi,
        /(\d{12})/g
      ];

      let aadhaarMatch = null;
      for (const pattern of aadhaarPatterns) {
        aadhaarMatch = parsedText.match(pattern);
        if (aadhaarMatch) {
          // Filter for 12-digit numbers
          const validNumbers = aadhaarMatch.filter(num => 
            num.replace(/[\s-]/g, '').length === 12
          );
          if (validNumbers.length > 0) {
            aadhaarMatch = validNumbers;
            break;
          }
        }
      }

      if (aadhaarMatch && aadhaarMatch.length > 0) {
        const number = aadhaarMatch[0].replace(/[\s-]/g, "");
        setAadhaarNumber(number);
        
        // Extract additional personal information
        const personalInfo = extractPersonalInfo(parsedText);
        
        // Call the callback if provided
        if (onAadhaarExtracted) {
          onAadhaarExtracted(number, personalInfo);
        }
        
        setResult({
          message: `✅ Aadhaar details extracted successfully!`,
          type: "success",
        });
      } else {
        setResult({
          message: "Aadhaar number not found in the image. Please ensure the image is clear and contains a valid Aadhaar card.",
          type: "warning",
        });
      }
    } catch (error: any) {
      console.error("OCR Error:", error);
      setResult({
        message: `Failed to process image: ${error.message}. Please try again.`,
        type: "error",
      });
    } finally {
      setOcrLoading(false);
    }
  }, [onAadhaarExtracted]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setResult({
        message: "File size too large. Please select an image under 5MB.",
        type: "error",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await processOCRResult(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && 
      (file.type.includes('jpeg') || file.type.includes('png') || file.type.includes('jpg'))
    );

    if (imageFiles.length === 0) {
      setResult({
        message: "Please drop a valid image file (JPEG, PNG)",
        type: "error",
      });
      return;
    }

    const file = imageFiles[0];
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await processOCRResult(file);
  }, [processOCRResult]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const clearResults = () => {
    setAadhaarNumber("");
    setExtractedText("");
    setExtractedName("");
    setResult(null);
    setUploadedImage(null);
  };

  const getResultIcon = () => {
    if (!result) return null;
    
    switch (result.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "info":
        return <FileText className="w-5 h-5" />;
      case "warning":
        return <Camera className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-center">
          <FileText className="w-6 h-6 text-white mr-2" />
          <h2 className="text-xl font-bold text-white">
            Aadhaar Card Verification
          </h2>
        </div>
        <p className="text-center text-blue-100 text-sm mt-1">
          Upload or drag & drop your Aadhaar card for automatic data extraction
        </p>
      </div>

      <div className="p-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : ocrLoading
              ? "border-gray-300 bg-gray-50"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {ocrLoading ? (
            <div className="flex flex-col items-center">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Processing your Aadhaar card...</p>
              <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
            </div>
          ) : uploadedImage ? (
            <div className="space-y-4">
              <img 
                src={uploadedImage} 
                alt="Uploaded Aadhaar" 
                className="max-w-xs mx-auto rounded-lg shadow-md"
              />
              <button
                onClick={clearResults}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Upload Different Image
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Upload Aadhaar Card Image
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Drag and drop or click to select your Aadhaar card image
                </p>
              </div>
              
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Camera className="w-5 h-5 mr-2" />
                Choose File
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/jpg"
                  disabled={ocrLoading}
                />
              </label>
              
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PNG, JPEG, JPG (Max 5MB)
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-xl border flex items-start space-x-3 ${
              result.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : result.type === "info"
                ? "bg-blue-50 text-blue-800 border-blue-200"
                : result.type === "warning"
                ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {getResultIcon()}
            <div className="flex-1">
              <p className="font-medium">{result.message}</p>
            </div>
          </div>
        )}

        {/* Extracted Information */}
        {(aadhaarNumber || extractedName) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Extracted Information
            </h3>
            <div className="space-y-2">
              {aadhaarNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Aadhaar Number:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                  </span>
                </div>
              )}
              {extractedName && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900">{extractedName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debug Information */}
        {extractedText && (
          <details className="mt-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
              View extracted text (for debugging)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 border rounded-lg max-h-32 overflow-y-auto text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {extractedText}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default AadhaarVerification;