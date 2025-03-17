import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useState } from "react";
import { useParams } from "wouter";
import type { MbtiResult } from "@/lib/types";
import { dimensionColors, dimensionScores, dimensionToLetters } from "@/lib/mbti";

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
        <p className="text-white">결과를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const scale = 5;

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [10, 10, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {Object.entries(dimensionColors).map(([dim, color], i) => {
          const scores = dimensionScores[result.result[i] as keyof typeof dimensionScores];
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
                score={Math.round(score * 100)}
              />
            );
          });
        })}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
}