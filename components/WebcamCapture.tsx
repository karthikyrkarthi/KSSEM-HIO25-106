import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WebcamCaptureProps {
  onComplete: (result: any) => void;
}

const WebcamCapture = ({ onComplete }: WebcamCaptureProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<"idle" | "camera" | "captured" | "analyzing">("idle");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus("camera");
      toast.success("Camera started");
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Failed to access camera. Please check permissions.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      setStatus("captured");
      
      // Stop camera after capture
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      toast.success("Image captured successfully");
    }
  };

  const analyzeEmotion = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setStatus("analyzing");

    try {
      // Convert base64 data URL to Blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');

      // Call backend API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const apiResponse = await fetch(`${import.meta.env.VITE_API_URL}/detect_emotion`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!apiResponse.ok) {
        throw new Error("Failed to detect emotion");
      }

      const data = await apiResponse.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Format response to match expected structure
      const result = {
        dominant_emotion: data.dominant_emotion,
        confidence: data.confidence,
        emotions: data.emotions || {},
        timestamp: new Date().toISOString(),
      };

      toast.success(`Emotion detected: ${data.dominant_emotion} (${Math.round(data.confidence)}% confidence)`);
      
      setIsAnalyzing(false);
      onComplete(result);
    } catch (error: any) {
      console.error("Analysis error:", error);
      if (error.name === 'AbortError') {
        toast.error("Request timed out. Please try again with a clearer image.");
      } else {
        toast.error(error.message || "Failed to analyze emotion. Please try again.");
      }
      setStatus("captured");
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-8 shadow-medium">
      <h2 className="text-3xl font-bold mb-6">Facial Emotion Detection</h2>
      <p className="text-muted-foreground mb-8">
        We'll analyze your facial expressions to detect your current emotional state.
        Please ensure you're in a well-lit environment for best results.
      </p>

      <div className="space-y-6">
        <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
          {status === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Click Start Camera to begin</p>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${
              status === "camera" ? "block" : "hidden"
            }`}
          />

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-4 justify-center">
          {status === "idle" && (
            <Button
              size="lg"
              onClick={startCamera}
              className="gradient-lavender shadow-soft"
            >
              <Camera className="mr-2 w-5 h-5" />
              Start Camera
            </Button>
          )}

          {status === "camera" && (
            <Button
              size="lg"
              onClick={captureImage}
              className="gradient-mint shadow-soft"
            >
              <CheckCircle className="mr-2 w-5 h-5" />
              Capture Image
            </Button>
          )}

          {status === "captured" && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setCapturedImage(null);
                  startCamera();
                }}
              >
                Retake
              </Button>
              <Button
                size="lg"
                onClick={analyzeEmotion}
                disabled={isAnalyzing}
                className="gradient-sky shadow-soft"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Emotion"
                )}
              </Button>
            </>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {["Camera", "Captured", "Analyzing"].map((label, idx) => (
            <div
              key={label}
              className={`px-3 py-1 rounded-full text-sm transition-smooth ${
                ["camera", "captured", "analyzing"].indexOf(status) >= idx
                  ? "gradient-lavender text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default WebcamCapture;
