import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface DataPoint {
  name: string;
  x: number;
  y: number;
  z: number;
}

export default function Universe() {
  const { id } = useParams();

  const { data: result, isLoading, error } = useQuery<MbtiResult & { 
    coordinateX: number | null;
    coordinateY: number | null;
    coordinateZ: number | null;
  }>({
    queryKey: [`/api/mbti-results/${id}`]
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

  // Ensure coordinates are numbers and handle null/undefined values
  const x = result.coordinateX ? Number(result.coordinateX) : 0;
  const y = result.coordinateY ? Number(result.coordinateY) : 0;
  const z = result.coordinateZ ? Number(result.coordinateZ) : 0;

  // Create data point for the scatter plot
  const data: DataPoint[] = [{
    name: result.result,
    x,
    y,
    z
  }];

  // Calculate domain based on coordinates
  const maxValue = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
  const domain = [-maxValue, maxValue];

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
          <p className="text-center mb-8 text-gray-600">
            당신의 MBTI 유형({result.result})의 우주 좌표:
            <br />
            X: {x.toFixed(2)}, 
            Y: {y.toFixed(2)}, 
            Z: {z.toFixed(2)}
          </p>
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
                  name="X" 
                  domain={domain}
                  label={{ value: 'X축 (E-I)', position: 'bottom' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Y"
                  domain={domain}
                  label={{ value: 'Y축 (N-S)', angle: -90, position: 'left' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="z" 
                  name="Z"
                  domain={domain}
                  range={[50, 400]}
                  label={{ value: 'Z축 (F-T)', position: 'insideRight' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DataPoint;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <p className="font-bold text-lg mb-2">{data.name}</p>
                          <p className="text-sm">X (E-I): {data.x.toFixed(2)}</p>
                          <p className="text-sm">Y (N-S): {data.y.toFixed(2)}</p>
                          <p className="text-sm">Z (F-T): {data.z.toFixed(2)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  name={result.result}
                  data={data}
                  fill="#8884d8"
                  shape="star"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}