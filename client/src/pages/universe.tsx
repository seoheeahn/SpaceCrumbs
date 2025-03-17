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
  const geometry = new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({ 
    color: "purple",
    metalness: 0.5,
    roughness: 0.5
  });

  return (
    <mesh position={position} geometry={geometry} material={material}>
      {/*Removed redundant meshStandardMaterial*/}
    </mesh>
  );
}

export default function Universe() {
  const { data: coordinates = [] } = useQuery<Coordinate[]>({
    queryKey: ["/api/universe-coordinates"],
  });

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {coordinates?.map((coord, index) => (
            <Planet
              key={index}
              position={[
                Number(coord.coordinateX) / 5, 
                Number(coord.coordinateY) / 5,
                Number(coord.coordinateZ) / 5
              ]}
            />
          ))}
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}