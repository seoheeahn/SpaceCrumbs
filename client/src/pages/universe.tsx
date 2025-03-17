import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line, Html } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import * as THREE from "three";

interface UniverseData {
  userId: string;
  result: string;
  scores: {
    "E-I": { E: number; I: number };
    "S-N": { S: number; N: number };
    "T-F": { T: number; F: number };
    "J-P": { J: number; P: number };
  };
  facets: {
    "E-I": Record<string, { [key: string]: number }>;
    "S-N": Record<string, { [key: string]: number }>;
    "T-F": Record<string, { [key: string]: number }>;
    "J-P": Record<string, { [key: string]: number }>;
  };
}

// 축 레이블 컴포넌트
function AxisLabel({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <Text
      position={position}
      fontSize={1}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

// 그리드 라인 컴포넌트
function GridLines() {
  const size = 30;
  const divisions = 30;
  const color = new THREE.Color(0x444444);

  return (
    <>
      <gridHelper args={[size, divisions, color, color]} rotation={[0, 0, 0]} />
      <gridHelper args={[size, divisions, color, color]} rotation={[Math.PI / 2, 0, 0]} />
      <gridHelper args={[size, divisions, color, color]} rotation={[0, 0, Math.PI / 2]} />
    </>
  );
}

// 행성 컴포넌트
function Planet({ 
  position, 
  size, 
  color, 
  label, 
  score 
}: { 
  position: [number, number, number]; 
  size: number; 
  color: string;
  label: string;
  score: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          metalness={0.8}
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      {hovered && (
        <Html>
          <div className="bg-black/80 text-white p-2 rounded-lg text-sm whitespace-nowrap">
            {label}: {score}%
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Universe() {
  const { data: universeData, isLoading } = useQuery<UniverseData>({
    queryKey: ["/api/universe-data"],
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-white">우주를 생성하는 중...</p>
      </div>
    );
  }

  if (!universeData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-white">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const scale = 0.2; // 전체적인 스케일 조정
  const dimensions = ["E-I", "S-N", "T-F", "J-P"];
  const dimensionColors = {
    "E-I": "#ff9500",
    "S-N": "#34c759",
    "T-F": "#007aff",
    "J-P": "#af52de"
  };

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />

          {/* 축 레이블 */}
          <AxisLabel position={[15, 0, 0]} text="E-I" />
          <AxisLabel position={[0, 15, 0]} text="S-N" />
          <AxisLabel position={[0, 0, 15]} text="T-F" />

          {/* 그리드 */}
          <GridLines />

          {/* MBTI 점수 행성들 */}
          {dimensions.map((dim, i) => {
            const scores = universeData.scores[dim as keyof typeof universeData.scores];
            const facets = universeData.facets[dim as keyof typeof universeData.facets];
            const color = dimensionColors[dim as keyof typeof dimensionColors];

            return Object.entries(scores).map(([trait, score], j) => {
              const position: [number, number, number] = [
                i === 0 ? score * scale : 0,
                i === 1 ? score * scale : 0,
                i === 2 ? score * scale : 0
              ];

              return (
                <Planet
                  key={`${dim}-${trait}`}
                  position={position}
                  size={0.5}
                  color={color}
                  label={`${trait}`}
                  score={score}
                />
              );
            });
          })}

          {/* 카메라 컨트롤 */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}