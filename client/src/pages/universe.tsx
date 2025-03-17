import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useState, Suspense } from "react";
import { useParams } from "wouter";
import type { MbtiResult } from "@shared/schema";
import { dimensionColors, calculateDimensionScores } from "@/lib/mbti";
import * as THREE from "three";

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
        <Text
          position={[0, size + 0.5, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`${label}: ${score.toFixed(1)}%`}
        </Text>
      )}
    </group>
  );
}

// Error Boundary for Three.js components
function ErrorFallback() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-white">3D 우주를 불러오는데 문제가 발생했습니다.</p>
    </div>
  );
}

export default function Universe() {
  const { id } = useParams();

  const { data: result, isLoading, error } = useQuery<MbtiResult>({
    queryKey: [`/api/mbti-results/${id}`],
    enabled: !!id
  });

  if (!id) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-white">잘못된 접근입니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-white">우주를 생성하는 중...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-white">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const scores = calculateDimensionScores(result.answers);
  const scale = 0.2;

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        gl={{ antialias: true }}
        camera={{ position: [20, 20, 20], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={<ErrorFallback />}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />

          {/* 축 레이블 */}
          <AxisLabel position={[15, 0, 0]} text="E-I" />
          <AxisLabel position={[0, 15, 0]} text="S-N" />
          <AxisLabel position={[0, 0, 15]} text="T-F" />

          {/* 그리드 */}
          <GridLines />

          {/* MBTI 점수 행성들 */}
          {/* E-I 축 */}
          <Planet
            position={[scores.E * scale, 0, 0]}
            size={0.5}
            color={dimensionColors["E-I"]}
            label="E"
            score={scores.E}
          />
          <Planet
            position={[-scores.I * scale, 0, 0]}
            size={0.5}
            color={dimensionColors["E-I"]}
            label="I"
            score={scores.I}
          />

          {/* S-N 축 */}
          <Planet
            position={[0, scores.N * scale, 0]}
            size={0.5}
            color={dimensionColors["S-N"]}
            label="N"
            score={scores.N}
          />
          <Planet
            position={[0, -scores.S * scale, 0]}
            size={0.5}
            color={dimensionColors["S-N"]}
            label="S"
            score={scores.S}
          />

          {/* T-F 축 */}
          <Planet
            position={[0, 0, scores.F * scale]}
            size={0.5}
            color={dimensionColors["T-F"]}
            label="F"
            score={scores.F}
          />
          <Planet
            position={[0, 0, -scores.T * scale]}
            size={0.5}
            color={dimensionColors["T-F"]}
            label="T"
            score={scores.T}
          />

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