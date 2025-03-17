import { useQuery } from "@tanstack/react-query";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";
import { Vector3 } from "three";

function Planet({ position, userId }: { position: [number, number, number]; userId: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="purple" emissive="purple" emissiveIntensity={0.2} />
      </mesh>
      <div className="text-white text-sm bg-black/50 px-2 py-1 rounded absolute transform translate-y-2">
        {userId}
        <div className="text-xs">
          X: {position[0].toFixed(2)}, Y: {position[1].toFixed(2)}, Z: {position[2].toFixed(2)}
        </div>
      </div>
    </group>
  );
}

function Universe() {
  const { data: coordinates, isLoading } = useQuery({
    queryKey: ["/api/universe-coordinates"],
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        Loading universe...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 50] }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <OrbitControls />
        {coordinates?.map((coord) => (
          <Planet
            key={coord.id}
            position={[
              Number(coord.coordinateX) / 10,
              Number(coord.coordinateY) / 10,
              Number(coord.coordinateZ) / 10,
            ]}
            userId={coord.userId}
          />
        ))}
      </Canvas>
    </div>
  );
}

export default Universe;