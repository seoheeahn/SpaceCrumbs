import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

function Scene({ coordinates }: { coordinates: [number, number, number] }) {
  return (
    <>
      <color attach="background" args={["#1e1e1e"]} />
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <mesh position={coordinates}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color="#00ffcc"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
    </>
  );
}

function ErrorFallback() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-gray-800">3D 우주를 불러오는데 문제가 발생했습니다.</p>
    </div>
  );
}

export default function Universe() {
  const { id } = useParams();

  const { data: result, isLoading, error } = useQuery<MbtiResult>({
    queryKey: [`/api/mbti-results/${id}`],
    enabled: !!id
  });

  if (!id || isLoading || error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <p className="text-gray-800">
          {!id ? "잘못된 접근입니다." : isLoading ? "우주를 생성하는 중..." : "데이터를 불러올 수 없습니다."}
        </p>
      </div>
    );
  }

  // Ensure all coordinates exist and convert to numbers
  if (typeof result.coordinateX !== 'number' || 
      typeof result.coordinateY !== 'number' || 
      typeof result.coordinateZ !== 'number') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <p className="text-gray-800">좌표 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const coordinates: [number, number, number] = [
    result.coordinateX,
    result.coordinateY,
    result.coordinateZ
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
          <p className="text-center mb-8 text-gray-600">
            당신의 MBTI 유형({result.result})의 우주 좌표:
            <br />
            X: {coordinates[0].toFixed(2)}, 
            Y: {coordinates[1].toFixed(2)}, 
            Z: {coordinates[2].toFixed(2)}
          </p>
          <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
            <Canvas
              camera={{ position: [0, 0, 150], fov: 50 }}
            >
              <Suspense fallback={<ErrorFallback />}>
                <Scene coordinates={coordinates} />
              </Suspense>
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}