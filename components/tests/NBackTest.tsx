import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface NBackTestProps {
  onComplete: (result: any) => void;
}

const NBackTest = ({ onComplete }: NBackTestProps) => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentLetter, setCurrentLetter] = useState("");
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [responses, setResponses] = useState<boolean[]>([]);
  const [correctResponses, setCorrectResponses] = useState(0);

  const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const totalTrials = 20;

  useEffect(() => {
    if (isStarted && currentIndex >= 0 && currentIndex < totalTrials) {
      const timer = setTimeout(() => {
        if (currentIndex < totalTrials - 1) {
          setCurrentIndex(currentIndex + 1);
          setCurrentLetter(sequence[currentIndex + 1]);
        } else {
          finishTest();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isStarted, currentIndex]);

  const startTest = () => {
    // Generate sequence with 30% matches
    const newSequence: string[] = [];
    for (let i = 0; i < totalTrials; i++) {
      if (i > 0 && Math.random() < 0.3) {
        newSequence.push(newSequence[i - 1]);
      } else {
        const availableLetters = i > 0 
          ? letters.filter(l => l !== newSequence[i - 1])
          : letters;
        newSequence.push(availableLetters[Math.floor(Math.random() * availableLetters.length)]);
      }
    }

    setSequence(newSequence);
    setCurrentIndex(0);
    setCurrentLetter(newSequence[0]);
    setIsStarted(true);
    setResponses([]);
    setCorrectResponses(0);
    toast.success("Test started! Press 'Match' if the letter matches the previous one.");
  };

  const handleMatch = () => {
    if (currentIndex <= 0) return;

    const isMatch = sequence[currentIndex] === sequence[currentIndex - 1];
    const newResponses = [...responses, true];
    setResponses(newResponses);

    if (isMatch) {
      setCorrectResponses(correctResponses + 1);
    }
  };

  const handleNoMatch = () => {
    if (currentIndex <= 0) return;

    const isMatch = sequence[currentIndex] === sequence[currentIndex - 1];
    const newResponses = [...responses, false];
    setResponses(newResponses);

    if (!isMatch) {
      setCorrectResponses(correctResponses + 1);
    }
  };

  const finishTest = () => {
    // Calculate accuracy
    const accuracy = Math.round((correctResponses / (totalTrials - 1)) * 100);
    
    // Normalize to 0-3 scale
    // >90% = 0, 70-90% = 1, 50-70% = 2, <50% = 3
    let normalizedScore = 0;
    if (accuracy < 50) normalizedScore = 3;
    else if (accuracy < 70) normalizedScore = 2;
    else if (accuracy < 90) normalizedScore = 1;

    setTimeout(() => {
      onComplete({
        testName: "1-Back",
        correctResponses: correctResponses,
        totalTrials: totalTrials - 1,
        accuracy: accuracy,
        normalizedScore: normalizedScore,
      });
    }, 1000);
  };

  return (
    <Card className="p-8 shadow-medium">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Target className="w-6 h-6 text-accent" />
          <h3 className="text-2xl font-bold">1-Back Test</h3>
        </div>

        <p className="text-muted-foreground">
          Press "Match" if the current letter is the same as the previous one,
          otherwise press "Different". Complete {totalTrials} trials.
        </p>

        {!isStarted && (
          <Button size="lg" onClick={startTest} className="gradient-sky">
            Start Test
          </Button>
        )}

        {isStarted && (
          <>
            <div className="text-sm text-muted-foreground">
              Trial {currentIndex + 1} / {totalTrials}
            </div>

            <motion.div
              key={currentIndex}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="w-48 h-48 mx-auto rounded-2xl gradient-lavender flex items-center justify-center"
            >
              <span className="text-8xl font-bold text-primary-foreground">
                {currentLetter}
              </span>
            </motion.div>

            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleMatch}
                disabled={currentIndex === 0}
                className="gradient-mint"
              >
                Match
              </Button>
              <Button
                size="lg"
                onClick={handleNoMatch}
                disabled={currentIndex === 0}
                variant="outline"
              >
                Different
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Correct: {correctResponses} / {responses.length}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default NBackTest;
