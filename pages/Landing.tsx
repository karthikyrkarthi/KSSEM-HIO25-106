import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-calm">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block p-6 rounded-3xl gradient-lavender shadow-medium mb-6"
            >
              <Brain className="w-16 h-16 text-primary-foreground" />
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            AI Stress Detector & Wellness Assistant
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Comprehensive stress analysis using facial emotion detection, cognitive assessments, 
            and health metrics. Get personalized wellness recommendations powered by AI.
          </p>

          <Button
            size="lg"
            onClick={() => navigate("/personal-details")}
            className="text-lg px-8 py-6 shadow-medium hover:shadow-strong transition-smooth gradient-lavender"
          >
            Start Stress Assessment
            <Zap className="ml-2 w-5 h-5" />
          </Button>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-card shadow-soft"
            >
              <div className="w-12 h-12 rounded-xl gradient-lavender flex items-center justify-center mb-4 mx-auto">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Emotion Detection</h3>
              <p className="text-muted-foreground">
                Advanced facial analysis using AI to detect emotional states with high accuracy
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-2xl bg-card shadow-soft"
            >
              <div className="w-12 h-12 rounded-xl gradient-mint flex items-center justify-center mb-4 mx-auto">
                <Activity className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cognitive Tests</h3>
              <p className="text-muted-foreground">
                Four scientifically validated tests measuring reaction time, memory, and attention
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-2xl bg-card shadow-soft"
            >
              <div className="w-12 h-12 rounded-xl gradient-sky flex items-center justify-center mb-4 mx-auto">
                <Heart className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Health Analysis</h3>
              <p className="text-muted-foreground">
                Comprehensive health metrics evaluation and personalized wellness recommendations
              </p>
            </motion.div>
          </div>

          <div className="mt-16 p-6 rounded-2xl bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Privacy Notice:</strong> All data is stored only in-memory 
              and will be cleared when you close this session. No persistent storage or external databases are used.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
