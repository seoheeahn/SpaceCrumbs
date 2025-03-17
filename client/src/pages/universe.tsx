import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense } from "react";

interface Coordinate {
  id: number;
  userId: string;
  coordinateX: number;
  coordinateY: number;
  coordinateZ: number;
}

function Planet({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="purple" />
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
          <Stars 
            radius={100} 
            depth={50} 
            count={5000} 
            factor={4} 
            saturation={0}
          />
          {coordinates?.map((coord, index) => (
            <Planet
              key={index}
              position={[
                coord.coordinateX / 5, 
                coord.coordinateY / 5,
                coord.coordinateZ / 5
              ]}
            />
          ))}
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  );
}