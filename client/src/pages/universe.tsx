import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

interface Coordinate {
  id: number;
  userId: string;
  coordinateX: number | null;
  coordinateY: number | null;
  coordinateZ: number | null;
}

function Planet({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial 
        color="purple"
        roughness={0.5}
        metalness={0.8}
      />
    </mesh>
  );
}

export default function Universe() {
  const { data: coordinates = [], isLoading } = useQuery<Coordinate[]>({
    queryKey: ["/api/universe-coordinates"],
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Loading coordinates...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {coordinates?.map((coord, index) => {
            if (coord.coordinateX === null || coord.coordinateY === null || coord.coordinateZ === null) {
              return null;
            }
            return (
              <Planet
                key={index}
                position={[
                  Number(coord.coordinateX) / 5, 
                  Number(coord.coordinateY) / 5,
                  Number(coord.coordinateZ) / 5
                ]}
              />
            );
          })}
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}