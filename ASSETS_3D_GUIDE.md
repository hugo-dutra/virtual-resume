# Guia de Assets 3D (Adventure Mode)

Este documento explica como adicionar, atualizar e organizar os modelos 3D usados no mapa interativo.

## 1. Estrutura de pastas

Todos os modelos 3D devem ficar em:

```text
public/assets/models/
```

Exemplos:

```text
public/assets/models/building-foton.glb
public/assets/models/player-hugo-avatar.glb
public/assets/models/ground-main.glb
```

## 2. Arquivo de mapeamento (manifesto)

O arquivo central que descreve os assets e sua relacao com o curriculo e:

```text
src/data/adventure-assets.json
```

Ele e validado por schema em:

```text
src/data/adventure-assets.schema.ts
```

## 3. Regra de nome dos arquivos

O sistema resolve automaticamente o arquivo por este padrao:

```text
<assetId>.<format>
```

Exemplo:

- `assetId`: `building-foton`
- `format`: `glb`
- arquivo esperado: `public/assets/models/building-foton.glb`

## 4. Campos do manifesto

Cada item em `assets` usa:

- `assetId`: id unico do asset (kebab-case, sem espacos).
- `category`: tipo do asset:
  - `experience` (predios de experiencia profissional)
  - `education` (landmarks de estudo)
  - `player` (avatar do jogador)
  - `ground` (modelo de chao/base da cidade)
- `relationId`: id funcional ligado ao dado do curriculo.
- `title`: nome amigavel.
- `description`: descricao da finalidade.
- `format`: `glb` ou `gltf`.
- `transform` (opcional):
  - `scale`: `{ x, y, z }`
  - `offset`: `{ x, y, z }`
  - `rotationY`: numero em radianos

## 5. IDs atualmente esperados

Experiencias:

- `building-foton` -> `foton-informatica`
- `building-ilia` -> `ilia`
- `building-seedf` -> `seedf`
- `building-infinity` -> `infinity`
- `building-physics-teacher-seedf` -> `physics-teacher-seedf`
- `building-autotrac` -> `autotrac`

Educacao:

- `education-etb` -> `etb`
- `education-ucb` -> `ucb`

Jogador:

- `player-hugo-avatar` -> `hugo-alves-dutra`

Chao:

- `ground-main` -> `world-main`

## 6. Fallback automatico (se arquivo nao existir)

Se o arquivo correspondente nao estiver em `public/assets/models`:

- `experience`: usa o bloco padrao (caixa).
- `education`: usa landmark padrao (bloco).
- `player`: usa a bolinha atual.
- `ground`: usa plano com textura e grid.

Ou seja: voce pode subir o JSON primeiro e ir colocando os modelos depois sem quebrar o projeto.

## 7. Passo a passo para adicionar/atualizar um asset

1. Exporte o modelo em `glb` (preferencial) ou `gltf`.
2. Nomeie o arquivo com `<assetId>.<format>`.
3. Coloque o arquivo em `public/assets/models/`.
4. Garanta que existe (ou crie) a entrada correspondente em `src/data/adventure-assets.json`.
5. Se necessario, ajuste `transform.scale`, `transform.offset` e `transform.rotationY`.
6. Rode:

```bash
npm run validate:data
npm run dev
```

## 8. Regras recomendadas de modelagem

- Use `kebab-case` no `assetId`.
- Evite espacos e acentos no nome de arquivo.
- Prefira `.glb` para facilitar entrega.
- Mantenha pivô centralizado e orientacao consistente.
- Mantenha tamanhos coerentes com o mapa (unidades do Three.js).
- Recomendacao de peso: ate ~5 MB por arquivo para boa performance.

## 9. Ground (modelo de chao/cidade)

Para usar um terreno/cidade personalizado:

1. Gere seu modelo com o id `ground-main`.
2. Salve como `public/assets/models/ground-main.glb` (ou `.gltf` se ajustar `format`).
3. Ajuste `transform` no manifesto para encaixar no mapa.

Exemplo:

```json
{
  "assetId": "ground-main",
  "category": "ground",
  "relationId": "world-main",
  "title": "Main Ground Model",
  "description": "City/terrain base for the adventure map.",
  "format": "glb",
  "transform": {
    "scale": { "x": 1.2, "y": 1, "z": 1.2 },
    "offset": { "x": 0, "y": 0, "z": 0 },
    "rotationY": 0
  }
}
```

## 10. Exemplo completo de entrada

```json
{
  "assetId": "building-foton",
  "category": "experience",
  "relationId": "foton-informatica",
  "title": "Foton Tower Model",
  "description": "Represents Foton experience.",
  "format": "glb",
  "transform": {
    "scale": { "x": 1, "y": 1, "z": 1 },
    "offset": { "x": 0, "y": 0, "z": 0 },
    "rotationY": 0
  }
}
```

## 11. Checklist rapido antes de commitar

1. Arquivo em `public/assets/models/` com nome correto.
2. Entrada correspondente em `adventure-assets.json`.
3. `npm run validate:data` sem erros.
4. Teste visual no modo Adventure.
