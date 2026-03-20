import { Bloom, BrightnessContrast, EffectComposer, Vignette } from '@react-three/postprocessing'

export function AdventurePostprocessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.72}
        mipmapBlur
      />
      <BrightnessContrast brightness={0.02} contrast={0.06} />
      <Vignette darkness={0.45} offset={0.22} eskil={false} />
    </EffectComposer>
  )
}
