import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// 좌표 정규화 함수 (0~100 범위로)
function normalize(x: number, y: number, z: number): [number, number, number] {
  const coordinates = [x, y, z];
  const min = Math.min(...coordinates);
  const max = Math.max(...coordinates);
  return coordinates.map(val => ((val - min) / (max - min)) * 100) as [number, number, number];
}

function Scene({ coordinates }: { coordinates: [number, number, number] }) {
  // Move coordinates to center (0,0,0)
  const [x, y, z] = coordinates.map(coord => coord - 50);

  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      {/* Coordinate axes */}
      <group>
        <mesh position={[x, y, z]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial 
            color="#00ffcc"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      </group>

      {/* Grid helpers */}
      <gridHelper args={[100, 10]} position={[0, -50, 0]} />
      <gridHelper args={[100, 10]} position={[0, 0, -50]} rotation={[Math.PI / 2, 0, 0]} />
    </>
  );
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

  if (!id || isLoading || error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <p className="text-gray-800">
          {!id ? "잘못된 접근입니다." : error ? "데이터를 불러올 수 없습니다." : "우주를 생성하는 중..."}
        </p>
      </div>
    );
  }

  // Ensure coordinates are numbers and handle null/undefined values
  const rawX = result.coordinateX ? Number(result.coordinateX) : 0;
  const rawY = result.coordinateY ? Number(result.coordinateY) : 0;
  const rawZ = result.coordinateZ ? Number(result.coordinateZ) : 0;

  // Normalize coordinates
  const normalizedCoords = normalize(rawX, rawY, rawZ);

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
            원본 좌표 - X: {rawX.toFixed(2)}, Y: {rawY.toFixed(2)}, Z: {rawZ.toFixed(2)}
            <br />
            정규화 좌표 - X: {normalizedCoords[0].toFixed(2)}, Y: {normalizedCoords[1].toFixed(2)}, Z: {normalizedCoords[2].toFixed(2)}
          </p>
          <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
            <Canvas
              camera={{ position: [50, 50, 150], fov: 50 }}
              style={{ background: '#1e1e1e' }}
            >
              <Scene coordinates={normalizedCoords} />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}