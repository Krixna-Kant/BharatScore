import React, { useState } from 'react';

interface VerificationResult {
  message: string;
  type: 'success' | 'error' | 'info';
}

const AadhaarVerification: React.FC = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setResult({ message: 'Uploading image...', type: 'info' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', 'eng');
      formData.append('apikey', 'K82469512788957'); // replace with a secure key
      formData.append('isOverlayRequired', 'false');

      const res = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const parsedText = data?.ParsedResults?.[0]?.ParsedText || '';

      if (!parsedText) {
        setResult({
          message: 'No text detected. Try another image.',
          type: 'error',
        });
        setOcrLoading(false);
        return;
      }

      setExtractedText(parsedText);

      const aadhaarMatch = parsedText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
      if (aadhaarMatch) {
        const number = aadhaarMatch[0].replace(/\s/g, '');
        setAadhaarNumber(number);
        setResult({
          message: `Aadhaar number extracted: ${number}`,
          type: 'success',
        });
      } else {
        setResult({
          message: 'Text extracted but Aadhaar number not found.',
          type: 'info',
        });
      }
    } catch (error: any) {
      setResult({
        message: `OCR error: ${error.message}`,
        type: 'error',
      });
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
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

        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          <p>This is a demo OCR extraction app using OCR.Space API.</p>
        </div>
      </div>
    </div>
  );
};

export default AadhaarVerification;
