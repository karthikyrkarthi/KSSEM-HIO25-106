import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface MemoryMatchTestProps {
  onComplete: (result: any) => void;
}

const MemoryMatchTest = ({ onComplete }: MemoryMatchTestProps) => {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  const emojis = ["🧠", "❤️", "⚡", "🎯", "🌟", "🎨", "🔥", "💎"];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const startGame = () => {
    setIsStarted(true);
    setStartTime(Date.now());
    toast.success("Game started! Match all pairs.");
  };

  const handleCardClick = (index: number) => {
    if (!isStarted) {
      toast.error("Click 'Start Game' first!");
      return;
    }

    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          const timeTaken = Math.floor((Date.now() - startTime) / 1000);
          
          // Calculate score (0-3, lower is better)
          // Perfect: <30s & <12 moves = 0
          // Good: <45s & <16 moves = 1
          // Fair: <60s & <20 moves = 2
          // Poor: >60s or >20 moves = 3
          let normalizedScore = 0;
          if (timeTaken > 60 || moves >= 20) normalizedScore = 3;
          else if (timeTaken > 45 || moves >= 16) normalizedScore = 2;
          else if (timeTaken > 30 || moves >= 12) normalizedScore = 1;

          setTimeout(() => {
            toast.success("All pairs matched!");
            onComplete({
              testName: "Memory Match",
              moves: moves + 1,
              timeSeconds: timeTaken,
              normalizedScore: normalizedScore,
            });
          }, 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <Card className="p-8 shadow-medium">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-secondary" />
          <h3 className="text-2xl font-bold">Memory Match</h3>
        </div>

        <p className="text-muted-foreground">
          Find all matching pairs as quickly as possible with minimum moves.
        </p>

        <div className="flex gap-4 justify-center text-sm">
          <div className="px-4 py-2 bg-muted rounded-lg">
            <span className="text-muted-foreground">Moves:</span>{" "}
            <span className="font-bold">{moves}</span>
          </div>
          <div className="px-4 py-2 bg-muted rounded-lg">
            <span className="text-muted-foreground">Matched:</span>{" "}
            <span className="font-bold">{matched.length / 2} / {cards.length / 2}</span>
          </div>
        </div>

        {!isStarted && (
          <Button size="lg" onClick={startGame} className="gradient-mint">
            Start Game
          </Button>
        )}

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {cards.map((emoji, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-xl flex items-center justify-center text-3xl cursor-pointer transition-smooth ${
                flipped.includes(index) || matched.includes(index)
                  ? matched.includes(index)
                    ? "gradient-mint"
                    : "gradient-sky"
                  : "gradient-lavender"
              }`}
            >
              {flipped.includes(index) || matched.includes(index) ? emoji : "?"}
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default MemoryMatchTest;
