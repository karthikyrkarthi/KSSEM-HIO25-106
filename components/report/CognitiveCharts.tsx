import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CognitiveChartsProps {
  tests: any[];
}

const CognitiveCharts = ({ tests }: CognitiveChartsProps) => {
  const chartData = tests.map((test) => ({
    name: test.testName,
    score: 3 - test.normalizedScore, // Invert for display (higher is better visually)
  }));

  const getColor = (score: number) => {
    if (score >= 2.5) return "hsl(142, 70%, 60%)"; // Green
    if (score >= 2) return "hsl(38, 92%, 50%)"; // Yellow
    if (score >= 1.5) return "hsl(24, 95%, 53%)"; // Orange
    return "hsl(0, 84%, 60%)"; // Red
  };

  return (
    <Card className="p-8 shadow-soft">
      <h2 className="text-2xl font-bold mb-6">Cognitive Test Performance</h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickFormatter={(value) => value.split(" ").join("\n")}
          />
          <YAxis
            stroke="hsl(var(--foreground))"
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            label={{ value: "Performance (3 = Best)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
            formatter={(value: any) => [`Performance: ${value.toFixed(2)}`, ""]}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        {tests.map((test, index) => (
          <div key={index} className="p-4 rounded-lg bg-muted">
            <h4 className="font-semibold mb-2">{test.testName}</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {test.avgReactionTime && (
                <p>Avg Reaction: {test.avgReactionTime}ms</p>
              )}
              {test.moves && <p>Moves: {test.moves}</p>}
              {test.timeSeconds && <p>Time: {test.timeSeconds}s</p>}
              {test.accuracy !== undefined && <p>Accuracy: {test.accuracy}%</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CognitiveCharts;
