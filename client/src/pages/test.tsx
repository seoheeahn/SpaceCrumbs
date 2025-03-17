import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { questions, type Answer } from "@/lib/questions";
import { calculateMbti } from "@/lib/mbti";
import { apiRequest } from "@/lib/queryClient";

export default function Test() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const progress = (currentQuestion / questions.length) * 100;

  const handleAnswer = async (value: number) => {
    const newAnswers = [
      ...answers,
      { questionId: questions[currentQuestion].id, value }
    ];
    setAnswers(newAnswers);

    if (currentQuestion === questions.length - 1) {
      const mbtiType = calculateMbti(newAnswers);
      const response = await apiRequest("POST", "/api/mbti-results", {
        answers: newAnswers,
        result: mbtiType,
        language: "ko",
        createdAt: new Date().toISOString()
      });
      const result = await response.json();
      setLocation(`/result/${result.id}`);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Progress value={progress} className="mb-8" />

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-6">
                {question.text.ko}
              </h2>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant="secondary"
                    onClick={() => handleAnswer(value)}
                    className="flex flex-col items-center justify-center p-4 h-auto"
                  >
                    <span className="text-lg font-semibold mb-1">{value}</span>
                    <span className="text-xs text-center">
                      {value === 1 && "전혀\n그렇지 않다"}
                      {value === 2 && "그렇지\n않다"}
                      {value === 3 && "보통"}
                      {value === 4 && "그렇다"}
                      {value === 5 && "매우\n그렇다"}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}