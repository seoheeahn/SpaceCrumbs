import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import type { MbtiResult } from "@shared/schema";
import { mbtiDescriptions, calculateDimensionScores } from "@/lib/mbti";
import { questions } from "@/lib/questions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function Result() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: result, isLoading } = useQuery<MbtiResult>({
    queryKey: [`/api/mbti-results/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>결과를 불러오는 중...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>결과를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const dimensionScores = calculateDimensionScores(result.answers);
  const dimensionChartData = [
    {
      dimension: "E/I",
      scores: [
        { name: "E", value: dimensionScores.E },
        { name: "I", value: dimensionScores.I }
      ],
      selected: result.result.includes("I") ? "I" : "E"
    },
    {
      dimension: "S/N",
      scores: [
        { name: "S", value: dimensionScores.S },
        { name: "N", value: dimensionScores.N }
      ],
      selected: result.result.includes("N") ? "N" : "S"
    },
    {
      dimension: "T/F",
      scores: [
        { name: "T", value: dimensionScores.T },
        { name: "F", value: dimensionScores.F }
      ],
      selected: result.result.includes("F") ? "F" : "T"
    },
    {
      dimension: "J/P",
      scores: [
        { name: "J", value: dimensionScores.J },
        { name: "P", value: dimensionScores.P }
      ],
      selected: result.result.includes("P") ? "P" : "J"
    }
  ];

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "My MBTI Result",
        text: `My MBTI type is ${result.result}`,
        url: window.location.href
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h1 className="text-3xl font-bold text-center mb-6">
                당신의 MBTI는 {result.result}입니다
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                {mbtiDescriptions[result.result as keyof typeof mbtiDescriptions].ko}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-white/50 rounded-2xl">
                {dimensionChartData.map((dimension, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-sm font-medium mb-2 text-center text-gray-600">{dimension.dimension}</h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dimension.scores}
                          layout="vertical"
                          margin={{ top: 10, right: 60, bottom: 10, left: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="name" type="category" hide />
                          <Bar
                            dataKey="value"
                            fill={`hsl(${index * 60 + 200}, 70%, 65%)`}
                            radius={[4, 4, 4, 4]}
                            animationDuration={1000}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="flex justify-between text-sm mt-2 px-2">
                        {dimension.scores.map((score, i) => (
                          <div 
                            key={i}
                            className={score.name === dimension.selected ? "font-bold" : "text-gray-600"}
                          >
                            {score.name} {Math.round(score.value)}%
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-center text-primary">응답 내역</h2>
                <div className="space-y-4">
                  {result.answers.map((answer) => {
                    const question = questions.find(q => q.id === answer.questionId);
                    if (!question) return null;

                    const isOptionA = answer.value <= 2;
                    const isOptionB = answer.value >= 4;
                    const isNeutral = answer.value === 3;

                    return (
                      <div key={answer.questionId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <p className="font-medium mb-2">{question.text.ko}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className={`p-2 rounded ${isOptionA || isNeutral ? "bg-primary/10 font-bold text-primary" : "text-gray-500"}`}>
                            {question.options.A}
                          </div>
                          <div className={`p-2 rounded text-right ${isOptionB || isNeutral ? "bg-primary/10 font-bold text-primary" : "text-gray-500"}`}>
                            {question.options.B}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleShare}
                className="w-full mb-4"
                variant="outline"
              >
                <Share2 className="w-4 h-4 mr-2" />
                결과 공유하기
              </Button>

              <Button
                onClick={() => setLocation('/')}
                className="w-full"
              >
                테스트 다시하기
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}