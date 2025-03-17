import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

// Normalize each axis independently
function normalizeByAxis(coordinates: [number, number, number][]): [number, number, number][] {
  // Extract arrays for each axis
  const xValues = coordinates.map(coord => coord[0]);
  const yValues = coordinates.map(coord => coord[1]);
  const zValues = coordinates.map(coord => coord[2]);

  // Function to normalize a single value within its axis range
  const normalizeValue = (value: number, values: number[]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return ((value - min) / (max - min)) * 100;
  };

  // Normalize each coordinate using axis-specific min/max
  return coordinates.map(([x, y, z]) => [
    normalizeValue(x, xValues),
    normalizeValue(y, yValues),
    normalizeValue(z, zValues)
  ]);
}

function Scene({ coordinates }: { coordinates: [number, number, number] }) {
  // Center the coordinates by subtracting 50
  const [x, y, z] = coordinates.map(coord => coord - 50);

  // Create sphere geometry once
  const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
  const material = new THREE.MeshStandardMaterial({ 
    color: "#00ffcc",
    roughness: 0.3,
    metalness: 0.7
  });

  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <color attach="background" args={["#1e1e1e"]} />

      <mesh position={[x, y, z]} geometry={sphereGeometry} material={material} />
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

  const { data: result, isLoading, error } = useQuery<MbtiResult & { 
    coordinateX: number | null;
    coordinateY: number | null;
    coordinateZ: number | null;
  }>({
    queryKey: [`/api/mbti-results/${id}`],
    enabled: !!id
  });

  if (!id || isLoading || error || !result || !result.coordinateX || !result.coordinateY || !result.coordinateZ) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <p className="text-gray-800">
          {!id ? "잘못된 접근입니다." : isLoading ? "우주를 생성하는 중..." : "데이터를 불러올 수 없습니다."}
        </p>
      </div>
    );
  }

  // Get coordinates and normalize using axis-specific ranges
  const normalizedCoords = normalizeByAxis([[
    Number(result.coordinateX),
    Number(result.coordinateY),
    Number(result.coordinateZ)
  ]])[0];

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
            X: {normalizedCoords[0].toFixed(2)}, 
            Y: {normalizedCoords[1].toFixed(2)}, 
            Z: {normalizedCoords[2].toFixed(2)}
          </p>
          <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
            <Canvas
              camera={{ position: [50, 50, 150], fov: 50 }}
            >
              <Suspense fallback={<ErrorFallback />}>
                <Scene coordinates={normalizedCoords} />
              </Suspense>
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}