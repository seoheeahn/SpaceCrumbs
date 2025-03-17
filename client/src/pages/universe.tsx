import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function CoordinateAxis({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Line>(null);

  return (
    <line ref={ref}>
      <bufferGeometry>
        <float32BufferAttribute 
          attach="attributes-position" 
          args={[new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z]), 3]} 
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} />
    </line>
  );
}

function CoordinateAxes() {
  const length = 50;
  return (
    <group>
      <CoordinateAxis 
        start={new THREE.Vector3(-length, 0, 0)} 
        end={new THREE.Vector3(length, 0, 0)} 
        color="red" 
      />
      <CoordinateAxis 
        start={new THREE.Vector3(0, -length, 0)} 
        end={new THREE.Vector3(0, length, 0)} 
        color="green" 
      />
      <CoordinateAxis 
        start={new THREE.Vector3(0, 0, -length)} 
        end={new THREE.Vector3(0, 0, length)} 
        color="blue" 
      />
    </group>
  );
}

function DataPoint({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scene } = useThree();

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="#00ffcc" metalness={0.7} roughness={0.3} />
    </mesh>
  );
}

function Scene({ coordinates }: { coordinates: [number, number, number] }) {
  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <CoordinateAxes />
      <DataPoint position={coordinates} />
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

  // Get normalized coordinates from database
  const coordinates: [number, number, number] = [
    Number(result.coordinateX),
    Number(result.coordinateY),
    Number(result.coordinateZ)
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
              gl={{ antialias: true }}
              camera={{ position: [50, 50, 50], fov: 60 }}
              style={{ background: '#1e1e1e' }}
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