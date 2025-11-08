import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface AttentionSwitchTestProps {
  onComplete: (result: any) => void;
}

const AttentionSwitchTest = ({ onComplete }: AttentionSwitchTestProps) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [task, setTask] = useState<"color" | "word">("color");
  const [correct, setCorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const colors = ["red", "blue", "green", "yellow"];
  const colorClasses = {
    red: "text-red-500",
    blue: "text-blue-500",
    green: "text-green-500",
    yellow: "text-yellow-500",
  };

  const totalTrials = 15;

  const startTest = () => {
    setIsStarted(true);
    setCurrentTrial(0);
    setCorrect(0);
    setReactionTimes([]);
    nextTrial();
    toast.success("Test started! Answer based on the instruction shown.");
  };

  const nextTrial = () => {
    const word = colors[Math.floor(Math.random() * colors.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newTask = Math.random() < 0.5 ? "color" : "word";
    
    setCurrentWord(word);
    setCurrentColor(color);
    setTask(newTask);
    setStartTime(Date.now());
  };

  const handleAnswer = (answer: string) => {
    const reactionTime = Date.now() - startTime;
    const isCorrect = task === "color" ? answer === currentColor : answer === currentWord;

    if (isCorrect) {
      setCorrect(correct + 1);
    }

    setReactionTimes([...reactionTimes, reactionTime]);

    if (currentTrial + 1 >= totalTrials) {
      finishTest(isCorrect ? correct + 1 : correct, [...reactionTimes, reactionTime]);
    } else {
      setCurrentTrial(currentTrial + 1);
      setTimeout(nextTrial, 500);
    }
  };

  const finishTest = (finalCorrect: number, finalTimes: number[]) => {
    const accuracy = Math.round((finalCorrect / totalTrials) * 100);
    const avgReactionTime = Math.floor(
      finalTimes.reduce((a, b) => a + b, 0) / finalTimes.length
    );

    // Normalize to 0-3 scale
    // >85% accuracy & <800ms avg = 0
    // >70% accuracy & <1000ms = 1
    // >55% accuracy & <1200ms = 2
    // else = 3
    let normalizedScore = 0;
    if (accuracy < 55 || avgReactionTime >= 1200) normalizedScore = 3;
    else if (accuracy < 70 || avgReactionTime >= 1000) normalizedScore = 2;
    else if (accuracy < 85 || avgReactionTime >= 800) normalizedScore = 1;

    setTimeout(() => {
      onComplete({
        testName: "Attention Switch",
        correct: finalCorrect,
        totalTrials: totalTrials,
        accuracy: accuracy,
        avgReactionTime: avgReactionTime,
        normalizedScore: normalizedScore,
      });
    }, 1000);
  };

  return (
    <Card className="p-8 shadow-medium">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Eye className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold">Attention Switch Test</h3>
        </div>

        <p className="text-muted-foreground">
          A Stroop-like test. Read the instruction and select the correct answer
          as quickly as possible. Complete {totalTrials} trials.
        </p>

        {!isStarted && (
          <Button size="lg" onClick={startTest} className="gradient-lavender">
            Start Test
          </Button>
        )}

        {isStarted && (
          <>
            <div className="text-sm text-muted-foreground">
              Trial {currentTrial + 1} / {totalTrials}
            </div>

            <div className="p-6 rounded-2xl bg-muted mb-6">
              <p className="text-lg font-bold mb-2">
                {task === "color" ? "Select the COLOR of the text" : "Select the WORD shown"}
              </p>
            </div>

            <motion.div
              key={`${currentTrial}-${task}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8"
            >
              <p
                className={`text-6xl font-bold ${
                  colorClasses[currentColor as keyof typeof colorClasses]
                }`}
              >
                {currentWord.toUpperCase()}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {colors.map((color) => (
                <Button
                  key={color}
                  size="lg"
                  onClick={() => handleAnswer(color)}
                  className="capitalize"
                  variant="outline"
                >
                  {color}
                </Button>
              ))}
            </div>

            <div className="text-sm text-muted-foreground mt-4">
              Correct: {correct} / {currentTrial}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default AttentionSwitchTest;
