
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ReceiptData {
  amount?: number;
  description?: string;
  date?: string;
}

interface ReceiptCaptureProps {
  onReceiptData: (data: ReceiptData) => void;
}

export const ReceiptCapture: React.FC<ReceiptCaptureProps> = ({ onReceiptData }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try uploading an image instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsUsingCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setImage(imageData);
        stopCamera();
        processReceipt(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImage(imageData);
        processReceipt(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processReceipt = async (imageData: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate receipt processing (in a real app, you'd use OCR API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data
      const mockData: ReceiptData = {
        amount: Math.floor(Math.random() * 100) + 10,
        description: "Receipt item",
        date: new Date().toISOString().split('T')[0]
      };
      
      onReceiptData(mockData);
      
      toast({
        title: "Receipt Processed!",
        description: `Extracted amount: $${mockData.amount}`,
      });
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process receipt. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!image && !isUsingCamera && (
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={startCamera}
            className="w-full flex items-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>Take Photo</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Image</span>
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {isUsingCamera && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <div className="flex space-x-2">
            <Button onClick={capturePhoto} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
            <Button variant="outline" onClick={stopCamera}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {image && (
        <div className="space-y-3">
          <div className="relative">
            <img 
              src={image} 
              alt="Receipt" 
              className="w-full rounded-lg max-h-64 object-contain bg-gray-100"
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                  <p>Processing receipt...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={clearImage}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </Button>
            {!isProcessing && (
              <Button
                onClick={() => processReceipt(image)}
                className="flex-1 flex items-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Process Again</span>
              </Button>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      
      <div className="text-xs text-gray-500 text-center">
        Capture or upload a receipt image to automatically extract transaction details
      </div>
    </div>
  );
};
