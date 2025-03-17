import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import type { MbtiResult } from "@shared/schema";
import { mbtiDescriptions, calculateDimensionScores } from "@/lib/mbti";
import { questions } from "@/lib/questions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      dimension: "외향성/내향성",
      scores: [
        { name: "외향성(E)", value: dimensionScores.E },
        { name: "내향성(I)", value: dimensionScores.I }
      ]
    },
    {
      dimension: "감각/직관",
      scores: [
        { name: "감각(S)", value: dimensionScores.S },
        { name: "직관(N)", value: dimensionScores.N }
      ]
    },
    {
      dimension: "사고/감정",
      scores: [
        { name: "사고(T)", value: dimensionScores.T },
        { name: "감정(F)", value: dimensionScores.F }
      ]
    },
    {
      dimension: "판단/인식",
      scores: [
        { name: "판단(J)", value: dimensionScores.J },
        { name: "인식(P)", value: dimensionScores.P }
      ]
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
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-semibold mb-4 text-center text-primary">{dimension.dimension}</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dimension.scores}
                          layout="vertical"
                          margin={{ top: 10, right: 10, bottom: 10, left: 80 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}
                          />
                          <Tooltip
                            formatter={(value) => [`${value}%`]}
                            contentStyle={{
                              borderRadius: '0.5rem',
                              border: 'none',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar
                            dataKey="value"
                            fill={`hsl(${index * 60 + 200}, 70%, 65%)`}
                            radius={[4, 4, 4, 4]}
                            animationDuration={1000}
                          />
                        </BarChart>
                      </ResponsiveContainer>
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

                    return (
                      <div key={answer.questionId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <p className="font-medium mb-2">{question.text.ko}</p>
                        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 text-sm text-gray-600">
                          <div>{question.options.A}</div>
                          <div className="font-semibold">{answer.value}</div>
                          <div className="text-right">{question.options.B}</div>
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