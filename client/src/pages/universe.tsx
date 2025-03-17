import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { Suspense } from "react";

interface Coordinate {
  id: number;
  userId: string;
  coordinateX: number | null;
  coordinateY: number | null;
  coordinateZ: number | null;
}

function Planet({ position, userId }: { position: [number, number, number]; userId: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="purple" 
          emissive="purple" 
          emissiveIntensity={0.2}
          roughness={0.5}
          metalness={0.8}
        />
      </mesh>
      <Html position={[0, 1, 0]} center>
        <div className="bg-black/50 px-2 py-1 rounded text-center whitespace-nowrap">
          <div className="text-white text-sm">{userId}</div>
          <div className="text-white/80 text-xs">
            ({position[0].toFixed(2)}, {position[1].toFixed(2)}, {position[2].toFixed(2)})
          </div>
        </div>
      </Html>
    </group>
  );
}

function Scene({ coordinates }: { coordinates: Coordinate[] }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0.5} 
        fade 
        speed={1}
      />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
      {coordinates?.map((coord) => (
        <Planet
          key={coord.id}
          position={[
            Number(coord.coordinateX) / 5, 
            Number(coord.coordinateY) / 5,
            Number(coord.coordinateZ) / 5
          ]}
          userId={coord.userId}
        />
      ))}
    </>
  );
}

function Universe() {
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
          powerPreference: "high-performance",
          preserveDrawingBuffer: true
        }}
      >
        <Suspense fallback={null}>
          <Scene coordinates={coordinates} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Universe;