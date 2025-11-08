import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ReactionTimeTest from "@/components/tests/ReactionTimeTest";
import MemoryMatchTest from "@/components/tests/MemoryMatchTest";
import NBackTest from "@/components/tests/NBackTest";
import AttentionSwitchTest from "@/components/tests/AttentionSwitchTest";
import { motion } from "framer-motion";

interface CognitiveTestsProps {
  onComplete: (result: any) => void;
}

const CognitiveTests = ({ onComplete }: CognitiveTestsProps) => {
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const tests = [
    { name: "Reaction Time", component: ReactionTimeTest },
    { name: "Memory Match", component: MemoryMatchTest },
    { name: "N-Back", component: NBackTest },
    { name: "Attention Switch", component: AttentionSwitchTest },
  ];

  const CurrentTestComponent = tests[currentTest].component;
  const progress = ((currentTest + 1) / tests.length) * 100;

  const handleTestComplete = (testResult: any) => {
    const newResults = [...results, testResult];
    setResults(newResults);

    if (currentTest < tests.length - 1) {
      setCurrentTest(currentTest + 1);
    } else {
      // Calculate final cognitive score
      const avgScore =
        newResults.reduce((sum, r) => sum + r.normalizedScore, 0) / newResults.length;
      
      const finalResult = {
        tests: newResults,
        cognitiveScore: Math.round(avgScore * 100) / 100,
        timestamp: new Date().toISOString(),
      };
      
      onComplete(finalResult);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-soft">
        <h2 className="text-2xl font-bold mb-4">Cognitive Assessment</h2>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Test {currentTest + 1} of {tests.length}: {tests[currentTest].name}
            </span>
            <span className="font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </Card>

      <motion.div
        key={currentTest}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <CurrentTestComponent onComplete={handleTestComplete} />
      </motion.div>
    </div>
  );
};

export default CognitiveTests;
