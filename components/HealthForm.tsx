import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface HealthFormProps {
  onComplete: (result: any) => void;
}

const HealthForm = ({ onComplete }: HealthFormProps) => {
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    bloodSugar: "",
    age: "",
    sex: "male",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const systolic = parseInt(formData.systolic);
    const diastolic = parseInt(formData.diastolic);
    const heartRate = parseInt(formData.heartRate);
    const bloodSugar = parseInt(formData.bloodSugar);
    const age = parseInt(formData.age);

    if (!systolic || !diastolic || !heartRate || !bloodSugar || !age) {
      toast.error("Please fill in all fields with valid numbers");
      return;
    }

    // Validate ranges
    if (systolic < 70 || systolic > 200) {
      toast.error("Systolic BP should be between 70-200 mmHg");
      return;
    }
    if (diastolic < 40 || diastolic > 130) {
      toast.error("Diastolic BP should be between 40-130 mmHg");
      return;
    }
    if (heartRate < 40 || heartRate > 150) {
      toast.error("Heart rate should be between 40-150 bpm");
      return;
    }
    if (bloodSugar < 50 || bloodSugar > 400) {
      toast.error("Blood sugar should be between 50-400 mg/dL");
      return;
    }
    if (age < 18 || age > 100) {
      toast.error("Age should be between 18-100");
      return;
    }

    // Calculate health stress score (0-3 scale)
    // This is a rule-based algorithm mimicking a trained model
    let score = 0;

    // BP scoring
    if (systolic > 140 || diastolic > 90) score += 1;
    if (systolic > 160 || diastolic > 100) score += 0.5;

    // Heart rate scoring
    if (heartRate > 100 || heartRate < 60) score += 0.5;
    if (heartRate > 110) score += 0.5;

    // Blood sugar scoring
    if (bloodSugar > 140 || bloodSugar < 70) score += 1;
    if (bloodSugar > 180) score += 0.5;

    // Age factor
    if (age > 60) score += 0.5;

    // Cap at 3
    const healthScore = Math.min(Math.round(score * 100) / 100, 3);

    const result = {
      systolic,
      diastolic,
      heartRate,
      bloodSugar,
      age,
      sex: formData.sex,
      healthScore: healthScore,
      timestamp: new Date().toISOString(),
    };

    toast.success("Health data submitted successfully");
    onComplete(result);
  };

  return (
    <Card className="p-8 shadow-medium max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-6 h-6 text-destructive" />
          <h3 className="text-2xl font-bold">Health Metrics</h3>
        </div>
        <p className="text-muted-foreground">
          Please enter your current health metrics. All fields are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="systolic">Systolic BP (mmHg)</Label>
            <Input
              id="systolic"
              type="number"
              placeholder="120"
              value={formData.systolic}
              onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
              min="70"
              max="200"
            />
            <p className="text-xs text-muted-foreground">Normal: 90-120</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diastolic">Diastolic BP (mmHg)</Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="80"
              value={formData.diastolic}
              onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
              min="40"
              max="130"
            />
            <p className="text-xs text-muted-foreground">Normal: 60-80</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              value={formData.heartRate}
              onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
              min="40"
              max="150"
            />
            <p className="text-xs text-muted-foreground">Normal: 60-100</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodSugar">Blood Sugar (mg/dL)</Label>
            <Input
              id="bloodSugar"
              type="number"
              placeholder="100"
              value={formData.bloodSugar}
              onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
              min="50"
              max="400"
            />
            <p className="text-xs text-muted-foreground">Normal: 70-140</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="30"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              min="18"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <Select value={formData.sex} onValueChange={(value) => setFormData({ ...formData, sex: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full gradient-lavender shadow-soft">
          Submit Health Data
        </Button>
      </form>

      <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Disclaimer:</strong> This assessment is for wellness purposes only and should not
          replace professional medical advice. Consult healthcare providers for medical concerns.
        </p>
      </div>
    </Card>
  );
};

export default HealthForm;
