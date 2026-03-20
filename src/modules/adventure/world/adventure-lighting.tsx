export function AdventureLighting() {
  return (
    <>
      <ambientLight intensity={0.42} color="#dbeafe" />
      <hemisphereLight intensity={0.32} color="#93c5fd" groundColor="#0b3b19" />

      <directionalLight
        castShadow
        intensity={1.25}
        position={[12, 18, 6]}
        color="#f1f5f9"
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />
    </>
  )
}
