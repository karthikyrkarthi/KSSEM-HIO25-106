import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Brain, Heart, FileText } from "lucide-react";
import WebcamCapture from "@/components/WebcamCapture";
import CognitiveTests from "@/components/CognitiveTests";
import HealthForm from "@/components/HealthForm";
import { useNavigate, useLocation } from "react-router-dom";

type SessionStep = "emotion" | "cognitive" | "health" | "complete";

interface SessionData {
  sessionId: string;
  emotionResult: any;
  cognitiveResult: any;
  healthResult: any;
}

const Session = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const personalDetails = location.state?.personalDetails;
  
  const [currentStep, setCurrentStep] = useState<SessionStep>("emotion");
  const [sessionData, setSessionData] = useState<SessionData>({
    sessionId: crypto.randomUUID(),
    emotionResult: null,
    cognitiveResult: null,
    healthResult: null,
  });

  const steps = [
    { id: "emotion", label: "Emotion Detection", icon: Camera },
    { id: "cognitive", label: "Cognitive Tests", icon: Brain },
    { id: "health", label: "Health Metrics", icon: Heart },
    { id: "complete", label: "View Report", icon: FileText },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleEmotionComplete = (result: any) => {
    setSessionData((prev) => ({ ...prev, emotionResult: result }));
    setCurrentStep("cognitive");
  };

  const handleCognitiveComplete = (result: any) => {
    setSessionData((prev) => ({ ...prev, cognitiveResult: result }));
    setCurrentStep("health");
  };

  const handleHealthComplete = (result: any) => {
    setSessionData((prev) => ({ ...prev, healthResult: result }));
    setCurrentStep("complete");
    // Navigate to report with all data
    navigate("/report", { 
      state: { 
        sessionData: { ...sessionData, healthResult: result },
        personalDetails 
      } 
    });
  };

  return (
    <div className="min-h-screen gradient-calm py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex flex-col items-center ${
                    index <= currentStepIndex ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-smooth ${
                      index < currentStepIndex
                        ? "gradient-mint"
                        : index === currentStepIndex
                        ? "gradient-lavender"
                        : "bg-muted"
                    }`}
                  >
                    <step.icon
                      className={`w-6 h-6 ${
                        index <= currentStepIndex ? "text-white" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-center hidden sm:block">
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-lavender transition-smooth"
                      style={{
                        width: index < currentStepIndex ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Progress value={progress} className="h-2" />
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep === "emotion" && (
            <motion.div
              key="emotion"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <WebcamCapture onComplete={handleEmotionComplete} />
            </motion.div>
          )}

          {currentStep === "cognitive" && (
            <motion.div
              key="cognitive"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CognitiveTests onComplete={handleCognitiveComplete} />
            </motion.div>
          )}

          {currentStep === "health" && (
            <motion.div
              key="health"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HealthForm onComplete={handleHealthComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Session;
