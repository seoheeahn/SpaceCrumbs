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

function getFacetWeights(value: number): { A: number; B: number } {
  if (value === 1) return { A: 100, B: 0 };
  if (value === 2) return { A: 75, B: 25 };
  if (value === 3) return { A: 50, B: 50 };
  if (value === 4) return { A: 25, B: 75 };
  if (value === 5) return { A: 0, B: 100 };
  return { A: 50, B: 50 };
}

type FacetGroup = {
  category: string;
  title: string;
  facets: {
    id: number;
    facet: string;
    selected: "A" | "B" | "neutral";
    weights: { A: number; B: number };
  }[];
};

export default function Result() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: result, isLoading } = useQuery<MbtiResult>({
    queryKey: [`/api/mbti-results/${id}`]
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
      scoreA: dimensionScores.E,
      scoreB: dimensionScores.I,
      selected: result.result.includes("I") ? "I" : "E"
    },
    {
      dimension: "감각/직관",
      scoreA: dimensionScores.S,
      scoreB: dimensionScores.N,
      selected: result.result.includes("N") ? "N" : "S"
    },
    {
      dimension: "사고/감정",
      scoreA: dimensionScores.T,
      scoreB: dimensionScores.F,
      selected: result.result.includes("F") ? "F" : "T"
    },
    {
      dimension: "판단/인식",
      scoreA: dimensionScores.J,
      scoreB: dimensionScores.P,
      selected: result.result.includes("P") ? "P" : "J"
    }
  ];

  // 질문들을 MBTI 차원별로 그룹화
  const facetGroups: FacetGroup[] = dimensionChartData.map(dimension => {
    const categoryQuestions = questions.filter(q => 
      q.category === dimension.dimension.replace("외향성/내향성", "E/I")
        .replace("감각/직관", "S/N")
        .replace("사고/감정", "T/F")
        .replace("판단/인식", "J/P")
    );
    const answers = result.answers;

    return {
      category: dimension.dimension,
      title: dimension.dimension,
      facets: categoryQuestions.map(q => {
        const answer = answers.find(a => a.questionId === q.id);
        const selected = answer
          ? (answer.value <= 2 ? "A" : answer.value >= 4 ? "B" : "neutral")
          : "neutral";
        const weights = answer ? getFacetWeights(answer.value) : { A: 50, B: 50 };
        return {
          id: q.id,
          facet: q.facet,
          selected,
          weights
        };
      })
    };
  });

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
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-3xl font-bold text-center mb-6">
                당신의 MBTI는 {result.result}입니다
              </h1>

              <p className="text-lg text-gray-600 mb-8 text-center">
                {mbtiDescriptions[result.result as keyof typeof mbtiDescriptions].ko}
              </p>

              <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dimensionChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, bottom: 5, left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="dimension" type="category" width={100} />
                      <Bar
                        dataKey="scoreA"
                        fill="hsl(200, 70%, 65%)"
                        stackId="stack"
                        radius={[4, 0, 0, 4]}
                      />
                      <Bar
                        dataKey="scoreB"
                        fill="hsl(260, 70%, 65%)"
                        stackId="stack"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                {facetGroups.map((group, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-3 text-center text-primary">
                      {group.title}
                    </h2>
                    <div className="space-y-2">
                      {group.facets.map((facet) => {
                        const [typeA, typeB] = facet.facet.split("-");
                        const facetData = [
                          { type: typeA, value: facet.weights.A },
                          { type: typeB, value: facet.weights.B }
                        ];
                        return (
                          <div key={facet.id} className="bg-gray-50 p-2 rounded-lg">
                            <div className="h-8">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={facetData}
                                  layout="horizontal"
                                  barGap={0}
                                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                  <XAxis type="number" domain={[0, 100]} />
                                  <YAxis type="category" dataKey="type" />
                                  <Bar
                                    dataKey="value"
                                    stackId="stack"
                                    fill={`hsl(${index * 60 + 200}, 70%, 65%)`}
                                    radius={[4, 4, 4, 4]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center mt-1">
                              <div className={`text-center ${
                                facet.selected === "A" ? "font-bold text-primary" : 
                                facet.selected === "neutral" ? "text-primary" : "text-gray-500"
                              }`}>
                                {typeA} {facet.weights.A}%
                              </div>
                              <div className="text-xs text-gray-400">vs</div>
                              <div className={`text-center ${
                                facet.selected === "B" ? "font-bold text-primary" : 
                                facet.selected === "neutral" ? "text-primary" : "text-gray-500"
                              }`}>
                                {typeB} {facet.weights.B}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
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
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}