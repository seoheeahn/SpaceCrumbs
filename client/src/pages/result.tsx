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
  const chartData = [
    { name: 'E/I', E: dimensionScores.E, I: dimensionScores.I },
    { name: 'S/N', S: dimensionScores.S, N: dimensionScores.N },
    { name: 'T/F', T: dimensionScores.T, F: dimensionScores.F },
    { name: 'J/P', J: dimensionScores.J, P: dimensionScores.P },
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

              <div className="h-60 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="E" fill="#8884d8" name="외향성" />
                    <Bar dataKey="I" fill="#82ca9d" name="내향성" />
                    <Bar dataKey="S" fill="#8884d8" name="감각" />
                    <Bar dataKey="N" fill="#82ca9d" name="직관" />
                    <Bar dataKey="T" fill="#8884d8" name="사고" />
                    <Bar dataKey="F" fill="#82ca9d" name="감정" />
                    <Bar dataKey="J" fill="#8884d8" name="판단" />
                    <Bar dataKey="P" fill="#82ca9d" name="인식" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">응답 내역</h2>
                <div className="space-y-4">
                  {result.answers.map((answer) => {
                    const question = questions.find(q => q.id === answer.questionId);
                    if (!question) return null;

                    return (
                      <div key={answer.questionId} className="border rounded-lg p-4">
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