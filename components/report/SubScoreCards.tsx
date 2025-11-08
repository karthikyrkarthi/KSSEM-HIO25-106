import { Card } from "@/components/ui/card";
import { Brain, Heart, Smile } from "lucide-react";
import { motion } from "framer-motion";

interface SubScoreCardsProps {
  emotionScore: number;
  cognitiveScore: number;
  healthScore: number;
  emotionData: any;
}

const SubScoreCards = ({
  emotionScore,
  cognitiveScore,
  healthScore,
  emotionData,
}: SubScoreCardsProps) => {
  const cards = [
    {
      title: "Emotion Analysis",
      score: emotionScore,
      icon: Smile,
      gradient: "gradient-lavender",
      detail: emotionData
        ? `${emotionData.dominant_emotion} (${emotionData.confidence}%)`
        : "N/A",
    },
    {
      title: "Cognitive Performance",
      score: cognitiveScore,
      icon: Brain,
      gradient: "gradient-mint",
      detail: "4 tests completed",
    },
    {
      title: "Health Metrics",
      score: healthScore,
      icon: Heart,
      gradient: "gradient-sky",
      detail: "Physiological data analyzed",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6 shadow-soft hover:shadow-medium transition-smooth">
            <div className={`w-12 h-12 rounded-xl ${card.gradient} flex items-center justify-center mb-4`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{card.detail}</p>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{card.score.toFixed(2)}</span>
              <span className="text-muted-foreground">/ 3.00</span>
            </div>

            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={card.gradient}
                initial={{ width: 0 }}
                animate={{ width: `${(card.score / 3) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                style={{ height: "100%" }}
              />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default SubScoreCards;
