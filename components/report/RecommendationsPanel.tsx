import { Card } from "@/components/ui/card";
import { CheckCircle, Wind, Moon, Droplets, Clock, Phone } from "lucide-react";

interface RecommendationsPanelProps {
  stressLevel: string;
  finalScore: number;
}

const RecommendationsPanel = ({ stressLevel, finalScore }: RecommendationsPanelProps) => {
  const getRecommendations = () => {
    const recommendations = [];

    // Base recommendations for all levels
    recommendations.push({
      icon: Wind,
      title: "Deep Breathing Exercise",
      description: "Practice 4-7-8 breathing: Inhale for 4 seconds, hold for 7, exhale for 8. Repeat 3-5 times.",
      priority: "high",
    });

    if (finalScore >= 2.0) {
      recommendations.push({
        icon: Moon,
        title: "Improve Sleep Quality",
        description: "Aim for 7-9 hours of sleep. Create a consistent bedtime routine and avoid screens 1 hour before bed.",
        priority: "high",
      });
    }

    if (finalScore >= 1.5) {
      recommendations.push({
        icon: Droplets,
        title: "Stay Hydrated",
        description: "Drink 8-10 glasses of water daily. Dehydration can increase stress and affect cognitive function.",
        priority: "medium",
      });
    }

    recommendations.push({
      icon: Clock,
      title: "Take Regular Breaks",
      description: "Follow the 50-10 rule: 50 minutes of work, 10 minutes of break. Stand up, stretch, or take a short walk.",
      priority: "medium",
    });

    if (stressLevel === "Moderate" || stressLevel === "Severe") {
      recommendations.push({
        icon: Phone,
        title: "Consider Professional Help",
        description: "Your stress levels indicate you may benefit from speaking with a mental health professional.",
        priority: "high",
      });
    }

    // Add cognitive-specific recommendations
    recommendations.push({
      icon: CheckCircle,
      title: "Cognitive Training",
      description: "Engage in brain exercises like puzzles, memory games, or learn a new skill to improve cognitive performance.",
      priority: "low",
    });

    return recommendations.slice(0, 6);
  };

  const recommendations = getRecommendations();

  return (
    <Card className="p-8 shadow-soft">
      <h2 className="text-2xl font-bold mb-6">Personalized Recommendations</h2>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-5 rounded-xl border transition-smooth hover:shadow-soft ${
              rec.priority === "high"
                ? "border-destructive/30 bg-destructive/5"
                : rec.priority === "medium"
                ? "border-warning/30 bg-warning/5"
                : "border-border bg-muted/30"
            }`}
          >
            <div className="flex gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  rec.priority === "high"
                    ? "gradient-lavender"
                    : rec.priority === "medium"
                    ? "gradient-sky"
                    : "gradient-mint"
                }`}
              >
                <rec.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{rec.title}</h3>
                  {rec.priority === "high" && (
                    <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full">
                      Priority
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Analysis Summary
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {stressLevel === "Normal" &&
            "Your stress levels appear to be within normal range. Continue maintaining healthy habits and monitor your well-being regularly."}
          {stressLevel === "Mild" &&
            "You're experiencing mild stress. Focus on relaxation techniques and ensure adequate rest. These simple interventions can help prevent escalation."}
          {stressLevel === "Moderate" &&
            "Your stress levels are moderately elevated. Implement the high-priority recommendations immediately and consider lifestyle adjustments to reduce stress sources."}
          {stressLevel === "Severe" &&
            "Your stress levels are significantly elevated. We strongly recommend consulting with a healthcare professional or mental health specialist for personalized support and intervention."}
        </p>
      </div>
    </Card>
  );
};

export default RecommendationsPanel;
