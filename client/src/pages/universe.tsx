import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";
import type { Coordinate } from "@/lib/types";

function Planet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Scene({ coordinates }: { coordinates: Coordinate[] }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
      />
      {coordinates.map((coord, index) => (
        <Planet
          key={index}
          position={[coord.coordinates.x, coord.coordinates.y, coord.coordinates.z]}
        />
      ))}
      <OrbitControls />
    </>
  );
}

export default function Universe() {
  const { data: coordinates, isLoading, error } = useQuery<Coordinate[]>({
    queryKey: ["/api/universe-coordinates"]
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        우주 좌표를 불러오는 중...
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        좌표를 불러오는데 실패했습니다.
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <Scene coordinates={coordinates} />
        </Suspense>
      </Canvas>
    </div>
  );
}