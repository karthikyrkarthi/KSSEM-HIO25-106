import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StressGaugeProps {
  score: number;
  level: string;
}

const StressGauge = ({ score, level }: StressGaugeProps) => {
  const percentage = (score / 3) * 100;

  const getColor = () => {
    if (level === "Normal") return "hsl(142, 70%, 60%)";
    if (level === "Mild") return "hsl(38, 92%, 50%)";
    if (level === "Moderate") return "hsl(24, 95%, 53%)";
    return "hsl(0, 84%, 60%)";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="20"
          />
          
          {/* Animated progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={getColor()}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - percentage / 100) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            transform="rotate(-90 100 100)"
          />

          {/* Center text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            className="text-4xl font-bold fill-foreground"
          >
            {score.toFixed(2)}
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            className="text-sm fill-muted-foreground"
          >
            / 3.00
          </text>
        </svg>
      </div>

      <div className="mt-6 text-center">
        <div
          className="inline-block px-6 py-3 rounded-full text-xl font-bold text-white shadow-medium"
          style={{ background: getColor() }}
        >
          {level}
        </div>
      </div>
    </div>
  );
};

export default StressGauge;
