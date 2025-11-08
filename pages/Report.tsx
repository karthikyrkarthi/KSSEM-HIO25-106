import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import StressGauge from "@/components/report/StressGauge";
import SubScoreCards from "@/components/report/SubScoreCards";
import CognitiveCharts from "@/components/report/CognitiveCharts";
import RecommendationsPanel from "@/components/report/RecommendationsPanel";
import Chatbot from "@/components/Chatbot";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

const Report = () => {
  const location = useLocation();
  const sessionData = location.state?.sessionData;
  const personalDetails = location.state?.personalDetails;
  const [showChat, setShowChat] = useState(false);

  if (!sessionData) {
    return (
      <div className="min-h-screen gradient-calm flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Session Data</h2>
          <p className="text-muted-foreground">Please complete an assessment first.</p>
        </Card>
      </div>
    );
  }

  // Calculate final stress score using weighted fusion
  const emotionScore = calculateEmotionScore(sessionData.emotionResult);
  const cognitiveScore = sessionData.cognitiveResult?.cognitiveScore || 0;
  const healthScore = sessionData.healthResult?.healthScore || 0;

  const finalScore = Math.round(
    (0.4 * emotionScore + 0.35 * cognitiveScore + 0.25 * healthScore) * 100
  ) / 100;

  const stressLevel = getStressLevel(finalScore);

  const downloadPDF = async () => {
    try {
      toast.info("Generating PDF report...");
      
      const reportElement = document.getElementById("report-content");
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`stress-report-${new Date().toISOString().split("T")[0]}.pdf`);
      
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="min-h-screen gradient-calm py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Stress Assessment Report</h1>
            <div className="flex gap-3">
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="shadow-soft"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={() => setShowChat(!showChat)}
                className="gradient-lavender shadow-soft"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {showChat ? "Hide" : "Chat with AI"}
              </Button>
            </div>
          </div>

          <div id="report-content" className="space-y-6">
            {personalDetails && (
              <Card className="p-6 shadow-medium">
                <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Name:</span> {personalDetails.firstName} {personalDetails.lastName}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span> {personalDetails.email}
                  </div>
                  {personalDetails.phone && (
                    <div>
                      <span className="font-semibold">Phone:</span> {personalDetails.phone}
                    </div>
                  )}
                  {personalDetails.dateOfBirth && (
                    <div>
                      <span className="font-semibold">Date of Birth:</span> {new Date(personalDetails.dateOfBirth).toLocaleDateString()}
                    </div>
                  )}
                  {personalDetails.gender && (
                    <div>
                      <span className="font-semibold">Gender:</span> {personalDetails.gender}
                    </div>
                  )}
                  {personalDetails.location && (
                    <div>
                      <span className="font-semibold">Location:</span> {personalDetails.location}
                    </div>
                  )}
                </div>
              </Card>
            )}
            
            <Card className="p-8 shadow-medium">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Overall Stress Level</h2>
                <p className="text-muted-foreground">
                  Based on comprehensive analysis of emotion, cognitive, and health metrics
                </p>
              </div>
              
              <StressGauge score={finalScore} level={stressLevel} />

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Report generated on {new Date().toLocaleDateString()} at{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </Card>

            <SubScoreCards
              emotionScore={emotionScore}
              cognitiveScore={cognitiveScore}
              healthScore={healthScore}
              emotionData={sessionData.emotionResult}
            />

            {sessionData.cognitiveResult && (
              <CognitiveCharts tests={sessionData.cognitiveResult.tests} />
            )}

            <RecommendationsPanel stressLevel={stressLevel} finalScore={finalScore} />
          </div>

          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Chatbot 
                stressLevel={stressLevel} 
                finalScore={finalScore}
                reportContext={{
                  personalDetails,
                  emotionScore,
                  cognitiveScore,
                  healthScore,
                  finalScore,
                  stressLevel,
                  date: new Date().toLocaleDateString()
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to calculate emotion score (0-3 scale)
const calculateEmotionScore = (emotionResult: any) => {
  if (!emotionResult) return 0;

  const { dominant_emotion, emotions } = emotionResult;
  
  // Stress-related emotions get higher scores
  const stressEmotions = {
    angry: 3,
    fearful: 3,
    disgusted: 2.5,
    sad: 2,
    surprised: 1,
    neutral: 0.5,
    happy: 0,
  };

  return Math.min(stressEmotions[dominant_emotion as keyof typeof stressEmotions] || 1.5, 3);
};

// Helper function to map score to stress level
const getStressLevel = (score: number): string => {
  if (score < 1.0) return "Normal";
  if (score < 2.0) return "Mild";
  if (score < 2.5) return "Moderate";
  return "Severe";
};

export default Report;
