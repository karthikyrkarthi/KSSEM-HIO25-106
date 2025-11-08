import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ReactionTimeTestProps {
  onComplete: (result: any) => void;
}

const ReactionTimeTest = ({ onComplete }: ReactionTimeTestProps) => {
  const [status, setStatus] = useState<"idle" | "waiting" | "ready" | "clicked">("idle");
  const [startTime, setStartTime] = useState(0);
  const [reactions, setReactions] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const totalAttempts = 5;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startTest = () => {
    setStatus("waiting");
    const delay = Math.floor(Math.random() * 3000) + 2000;
    
    timeoutRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setStatus("ready");
    }, delay);
  };

  const handleClick = () => {
    if (status === "waiting") {
      toast.error("Too early! Wait for the green signal.");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("idle");
      return;
    }

    if (status === "ready") {
      const reactionTime = Date.now() - startTime;
      const newReactions = [...reactions, reactionTime];
      setReactions(newReactions);
      setAttempts(attempts + 1);
      setStatus("clicked");

      if (attempts + 1 >= totalAttempts) {
        // Calculate score
        const avgReaction = Math.floor(
          newReactions.reduce((a, b) => a + b, 0) / newReactions.length
        );
        
        // Normalize to 0-3 scale (lower is better)
        // <200ms = 0, 200-400ms = 1, 400-600ms = 2, >600ms = 3
        let normalizedScore = 0;
        if (avgReaction >= 600) normalizedScore = 3;
        else if (avgReaction >= 400) normalizedScore = 2;
        else if (avgReaction >= 200) normalizedScore = 1;

        setTimeout(() => {
          onComplete({
            testName: "Reaction Time",
            avgReactionTime: avgReaction,
            reactions: newReactions,
            normalizedScore: normalizedScore,
          });
        }, 1000);
      } else {
        setTimeout(() => setStatus("idle"), 1000);
      }
    }
  };

  return (
    <Card className="p-8 shadow-medium">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-warning" />
          <h3 className="text-2xl font-bold">Reaction Time Test</h3>
        </div>

        <p className="text-muted-foreground">
          Click as quickly as possible when the box turns green.
          Complete {totalAttempts} attempts.
        </p>

        <div className="text-sm text-muted-foreground">
          Attempt {attempts} / {totalAttempts}
        </div>

        <motion.div
          onClick={handleClick}
          className={`w-full h-64 rounded-xl flex items-center justify-center cursor-pointer transition-smooth ${
            status === "idle" || status === "waiting"
              ? "bg-muted"
              : status === "ready"
              ? "bg-success"
              : "bg-primary"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-center">
            {status === "idle" && (
              <p className="text-2xl font-bold text-foreground">Click to Start</p>
            )}
            {status === "waiting" && (
              <p className="text-2xl font-bold text-foreground">Wait...</p>
            )}
            {status === "ready" && (
              <p className="text-2xl font-bold text-success-foreground">Click Now!</p>
            )}
            {status === "clicked" && (
              <div className="text-primary-foreground">
                <p className="text-3xl font-bold">{reactions[reactions.length - 1]}ms</p>
                <p className="text-sm mt-2">
                  {attempts < totalAttempts ? "Next attempt..." : "Test complete!"}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {status === "idle" && attempts === 0 && (
          <Button size="lg" onClick={startTest} className="gradient-lavender">
            Start Test
          </Button>
        )}

        {status === "idle" && attempts > 0 && attempts < totalAttempts && (
          <Button size="lg" onClick={startTest} className="gradient-lavender">
            Next Attempt
          </Button>
        )}

        {reactions.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Your Reactions:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {reactions.map((time, idx) => (
                <span key={idx} className="px-3 py-1 bg-card rounded-full text-sm">
                  {time}ms
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReactionTimeTest;
