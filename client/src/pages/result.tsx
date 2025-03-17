import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download, Home } from "lucide-react";
import { MdPerson, MdSettings, MdFlashOn, MdFavorite, MdFavoriteBorder, MdStarBorder, MdChecklist } from "react-icons/md";
import type { MbtiResult } from "@shared/schema";
import { mbtiDescriptions, calculateDimensionScores } from "@/lib/mbti";
import { questions } from "@/lib/questions";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';

interface Answer {
  questionId: number;
  value: number;
}

function getFacetWeights(value: number): { A: number; B: number } {
  if (value === 1) return { A: 100, B: 0 };
  if (value === 2) return { A: 75, B: 25 };
  if (value === 3) return { A: 50, B: 50 };
  if (value === 4) return { A: 25, B: 75 };
  if (value === 5) return { A: 0, B: 100 };
  return { A: 50, B: 50 };
}

type DimensionKey = "외향성/내향성" | "감각/직관" | "사고/감정" | "판단/인식";
type MbtiLetter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

const dimensionColors: Record<DimensionKey, string> = {
  "외향성/내향성": "hsl(220, 70%, 65%)",  // 블루계열
  "감각/직관": "hsl(12, 75%, 65%)",      // 진한 연어색
  "사고/감정": "hsl(160, 75%, 65%)",     // 진한 민트색
  "판단/인식": "hsl(45, 75%, 60%)"       // 진한 황금색
} as const;

const facetColors: Record<DimensionKey, [string, string]> = {
  "외향성/내향성": ["hsl(220, 70%, 60%)", "hsl(220, 60%, 85%)"],
  "감각/직관": ["hsl(12, 75%, 60%)", "hsl(12, 65%, 85%)"],
  "사고/감정": ["hsl(160, 75%, 60%)", "hsl(160, 65%, 85%)"],
  "판단/인식": ["hsl(45, 75%, 55%)", "hsl(45, 65%, 80%)"]
} as const;

type FacetGroup = {
  category: DimensionKey;
  title: DimensionKey;
  facets: {
    id: number;
    facet: string;
    selected: "A" | "B" | "neutral";
    weights: { A: number; B: number };
  }[];
};

const mbtiIcons: Record<MbtiLetter, JSX.Element> = {
  E: <MdPerson className="w-12 h-12 drop-shadow-lg" />,
  I: <MdPerson className="w-12 h-12 drop-shadow-lg" />,
  S: <MdSettings className="w-12 h-12 drop-shadow-lg" />,
  N: <MdFlashOn className="w-12 h-12 drop-shadow-lg" />,
  T: <MdFavoriteBorder className="w-12 h-12 drop-shadow-lg" />,
  F: <MdFavorite className="w-12 h-12 drop-shadow-lg" />,
  J: <MdChecklist className="w-12 h-12 drop-shadow-lg" />,
  P: <MdStarBorder className="w-12 h-12 drop-shadow-lg" />
};

export default function Result() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const resultRef = useRef<HTMLDivElement>(null);
  const snsRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [snsImage, setSnsImage] = useState<string>('');

  const { data: result, isLoading } = useQuery<MbtiResult & { analysis?: string; coordinateX?: number; coordinateY?: number; coordinateZ?: number }>({
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

  const dimensionScores = calculateDimensionScores(result.answers as Answer[]);

  // Mapping from dimension key to MBTI letter pairs
  const dimensionToLetters: Record<DimensionKey, [MbtiLetter, MbtiLetter]> = {
    "외향성/내향성": ["E", "I"],
    "감각/직관": ["S", "N"],
    "사고/감정": ["T", "F"],
    "판단/인식": ["J", "P"]
  };

  // Generate facet groups with proper typing
  const facetGroups: FacetGroup[] = (Object.keys(dimensionColors) as DimensionKey[]).map(dimension => {
    const categoryQuestions = questions.filter(q =>
      q.category === dimension.replace("외향성/내향성", "E/I")
        .replace("감각/직관", "S/N")
        .replace("사고/감정", "T/F")
        .replace("판단/인식", "J/P")
    );

    return {
      category: dimension,
      title: dimension,
      facets: categoryQuestions.map(q => {
        const answer = result.answers.find(a => a.questionId === q.id);
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

  const handleShare = async (type: 'sns' | 'full') => {
    const targetRef = type === 'sns' ? snsRef : resultRef;
    if (targetRef.current) {
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        width: type === 'sns' ? 1080 : 800,
        height: type === 'sns' ? 1080 : targetRef.current.scrollHeight,
      });
      const image = canvas.toDataURL('image/png', 1.0);
      if (type === 'sns') {
        setSnsImage(image);
      } else {
        setPreviewImage(image);
      }
    }
  };

  const ResultContent = ({ showControls = true }) => (
    <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardContent className="pt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            당신의 우주좌표는
          </h1>
          <div className="flex justify-center gap-8 mb-8">
            {result.result.split("").map((letter, index) => {
              const dimension = Object.keys(dimensionColors)[index] as DimensionKey;
              const [letterA, letterB] = dimensionToLetters[dimension];
              const score = dimensionScores[letter as MbtiLetter];

              return (
                <div
                  key={index}
                  className="w-28 h-28 rounded-2xl flex items-center justify-center flex-col"
                  style={{
                    backgroundColor: `${dimensionColors[dimension]}40`,
                    color: dimensionColors[dimension]
                  }}
                >
                  {mbtiIcons[letter as MbtiLetter]}
                  <span className="text-3xl font-bold mt-2">{letter}</span>
                  <span className="text-sm mt-1">{Math.round(score)}%</span>
                </div>
              );
            })}
          </div>

          <div className="text-center mb-6">
            <p className="text-lg text-primary font-semibold">우주좌표값:</p>
            <p className="text-gray-600">
              X: {result.coordinateX?.toFixed(2)} | 
              Y: {result.coordinateY?.toFixed(2)} | 
              Z: {result.coordinateZ?.toFixed(2)}
            </p>
          </div>

          {result.analysis && (() => {
            try {
              const analysisData = JSON.parse(result.analysis);
              return (
                <Card className="mb-8 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-primary">✨ AI 분석 결과</h2>
                    <div className="space-y-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">🎭 {analysisData.Description}</h3>
                        <p className="text-gray-700">{analysisData.Analysis}</p>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">💪 강점</h3>
                        <ul className="list-none space-y-1">
                          {analysisData.Strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <span className="mr-2">•</span>{strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">🌱 성장 포인트</h3>
                        <ul className="list-none space-y-1">
                          {analysisData.Growth.map((point: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <span className="mr-2">•</span>{point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-medium mb-2">👥 대인관계 특징</h3>
                        <p className="text-gray-700">{analysisData.Social}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">💼 추천 직업</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysisData.Careers.map((career: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm"
                            >
                              {career}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            } catch (error) {
              console.error("Error parsing analysis JSON:", error);
              return (
                <div className="text-red-500">
                  분석 결과를 표시하는 중 오류가 발생했습니다.
                </div>
              );
            }
          })()}

          <div className="space-y-4">
            {facetGroups.map((group, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <h2 className="text-lg font-semibold mb-3 text-center"
                  style={{ color: dimensionColors[group.title] }}>
                  {group.title}
                </h2>
                <div className="space-y-1">
                  {group.facets.map((facet) => {
                    const [typeA, typeB] = facet.facet.split("-");
                    const [colorA, colorB] = facetColors[group.title];
                    const isADominant = facet.weights.A > facet.weights.B;
                    const isBDominant = facet.weights.B > facet.weights.A;

                    return (
                      <div key={facet.id} className="bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`text-sm font-medium text-right w-24 shrink-0 transition-all ${
                            isADominant ? `font-bold` : "text-gray-600"
                          }`}
                            style={{
                              color: isADominant ? dimensionColors[group.title] : undefined
                            }}>
                            {typeA}
                          </div>
                          <div className="grow h-5 relative bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 transition-all duration-500"
                              style={{
                                width: `${facet.weights.A}%`,
                                backgroundColor: dimensionColors[group.title]
                              }}
                            />
                            <div
                              className="absolute inset-y-0 right-0 transition-all duration-500"
                              style={{
                                width: `${facet.weights.B}%`,
                                backgroundColor: `${dimensionColors[group.title]}40`
                              }}
                            />
                          </div>
                          <div className={`text-sm font-medium w-24 shrink-0 transition-all ${
                            isBDominant ? `font-bold` : "text-gray-600"
                          }`}
                            style={{
                              color: isBDominant ? dimensionColors[group.title] : undefined
                            }}>
                            {typeB}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {showControls && (
            <div className="mt-8 space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      handleShare('sns');
                      handleShare('full');
                    }}
                    className="w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/80 transition-all duration-300"
                    variant="outline"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    결과 공유하기
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogTitle>MBTI 결과 공유</DialogTitle>
                  <DialogDescription>
                    원하시는 형식을 선택하여 저장하거나 공유하세요
                  </DialogDescription>
                  <Tabs defaultValue="sns" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sns">SNS 공유용</TabsTrigger>
                      <TabsTrigger value="full">상세 리포트</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sns" className="overflow-y-auto">
                      {snsImage && (
                        <div className="rounded-lg overflow-hidden shadow-lg">
                          <img src={snsImage} alt="MBTI Result for SNS" className="w-full" />
                          <div className="flex gap-4 mt-4">
                            <Button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.download = 'mbti-result-sns.png';
                                link.href = snsImage;
                                link.click();
                              }}
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              이미지 저장
                            </Button>
                            <Button
                              onClick={() => {
                                navigator.share({
                                  title: "My MBTI Result",
                                  text: `My MBTI type is ${result?.result}`,
                                  files: [new File([snsImage], 'mbti-result.png', { type: 'image/png' })]
                                }).catch(console.error);
                              }}
                              className="flex-1"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              공유하기
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="full" className="overflow-y-auto max-h-[60vh]">
                      {previewImage && (
                        <div className="rounded-lg overflow-hidden shadow-lg">
                          <ResultContent showControls={false} />
                          <div className="flex gap-4 mt-4">
                            <Button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.download = 'mbti-result-full.png';
                                link.href = previewImage;
                                link.click();
                              }}
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              이미지 저장
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              <Button
                onClick={() => setLocation('/')}
                className="w-full bg-white hover:bg-gray-50 text-primary hover:text-primary/80 transition-colors duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
      {/* SNS 공유용 숨겨진 컴포넌트 */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div ref={snsRef} className="w-[1080px] h-[1080px] bg-gradient-to-b from-white to-gray-50 p-12 flex flex-col items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center">MBTI 성격 유형 결과</h1>
            <div className="flex gap-8 mb-8 justify-center">
              {result.result.split("").map((letter, index) => {
                const dimension = Object.keys(dimensionColors)[index] as DimensionKey;
                return (
                  <div
                    key={index}
                    className="w-40 h-40 rounded-3xl flex items-center justify-center flex-col"
                    style={{
                      backgroundColor: `${dimensionColors[dimension]}40`,
                      color: dimensionColors[dimension]
                    }}
                  >
                    {mbtiIcons[letter as MbtiLetter]}
                    <span className="text-5xl font-bold mt-4">{letter}</span>
                  </div>
                );
              })}
            </div>
            {result.analysis && (
              <div className="mt-8 p-6 bg-primary/5 rounded-2xl">
                <h2 className="text-2xl font-semibold mb-4 text-primary">AI 분석 결과</h2>
                <p className="text-lg text-gray-700">
                  {result.analysis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-8" ref={resultRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ResultContent />
        </motion.div>
      </div>
    </div>
  );
}