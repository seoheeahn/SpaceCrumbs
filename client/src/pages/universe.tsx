import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

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
        </Suspense>
      </Canvas>
    </div>
  );
}