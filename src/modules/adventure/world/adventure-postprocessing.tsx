import { Bloom, BrightnessContrast, EffectComposer, Vignette } from '@react-three/postprocessing'

export function AdventurePostprocessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.72}
        mipmapBlur
      />
      <BrightnessContrast brightness={0.08} contrast={0.05} />
      <Vignette darkness={0.28} offset={0.2} eskil={false} />
    </EffectComposer>
  )
}
