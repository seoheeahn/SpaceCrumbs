import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { dimensionColors, calculateDimensionScores } from "@/lib/mbti";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface DataPoint {
  name: string;
  x: number;
  y: number;
  z: number;
  color: string;
}

export default function Universe() {
  const { id } = useParams();
  const scale = 0.2;

  const { data: result, isLoading, error } = useQuery<MbtiResult>({
    queryKey: [`/api/mbti-results/${id}`],
    enabled: !!id
  });

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <p className="text-white">잘못된 접근입니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <p className="text-white">우주를 생성하는 중...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <p className="text-white">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const scores = calculateDimensionScores(result.answers);

  // Create data points for the scatter plot
  const data: DataPoint[] = [
    {
      name: 'E',
      x: scores.E * scale,
      y: 0,
      z: 0,
      color: dimensionColors["E-I"]
    },
    {
      name: 'I',
      x: -scores.I * scale,
      y: 0,
      z: 0,
      color: dimensionColors["E-I"]
    },
    {
      name: 'S',
      x: 0,
      y: -scores.S * scale,
      z: 0,
      color: dimensionColors["S-N"]
    },
    {
      name: 'N',
      x: 0,
      y: scores.N * scale,
      z: 0,
      color: dimensionColors["S-N"]
    },
    {
      name: 'T',
      x: 0,
      y: 0,
      z: -scores.T * scale,
      color: dimensionColors["T-F"]
    },
    {
      name: 'F',
      x: 0,
      y: 0,
      z: scores.F * scale,
      color: dimensionColors["T-F"]
    }
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">우주 좌표계에서 보기</h1>
          <div className="w-full h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="E-I" 
                  domain={[-1, 1]}
                  label={{ value: 'E-I', position: 'bottom' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="S-N"
                  domain={[-1, 1]}
                  label={{ value: 'S-N', angle: -90, position: 'left' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="z" 
                  name="T-F"
                  domain={[-1, 1]}
                  range={[50, 400]}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DataPoint;
                      return (
                        <div className="bg-white p-2 rounded shadow">
                          <p className="font-bold">{data.name}</p>
                          <p>X: {data.x.toFixed(2)}</p>
                          <p>Y: {data.y.toFixed(2)}</p>
                          <p>Z: {data.z.toFixed(2)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {data.map((point, index) => (
                  <Scatter
                    key={index}
                    name={point.name}
                    data={[point]}
                    fill={point.color}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}