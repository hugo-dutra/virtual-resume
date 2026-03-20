type AdventureHudProps = {
  buildingCount: number
  activeBuildingCount: number
  hoveredBuildingName: string | null
  selectedBuildingName: string | null
}

export function AdventureHud({
  buildingCount,
  activeBuildingCount,
  hoveredBuildingName,
  selectedBuildingName,
}: AdventureHudProps) {
  return (
    <aside className="pointer-events-none absolute left-4 top-4 z-10 space-y-3 text-xs text-cyan-100">
      <div className="rounded-lg border border-cyan-200/40 bg-slate-950/65 px-3 py-2 backdrop-blur">
        <p className="font-semibold uppercase tracking-[0.18em]">Comandos</p>
        <p className="mt-1">WASD ou setas para mover</p>
        <p>Shift para sprint</p>
      </div>

      <div className="rounded-lg border border-cyan-200/40 bg-slate-950/65 px-3 py-2 backdrop-blur">
        <p className="font-semibold uppercase tracking-[0.18em]">Mapa</p>
        <p className="mt-1">Predios interativos: {buildingCount}</p>
        <p>Predios renderizados: {activeBuildingCount}</p>
        <p>Hover: {hoveredBuildingName ?? 'nenhum predio selecionado'}</p>
        <p>Ativo: {selectedBuildingName ?? 'nenhum'}</p>
        <p className="mt-1 text-cyan-200/85">Clique no predio para abrir experiencia</p>
      </div>
    </aside>
  )
}
