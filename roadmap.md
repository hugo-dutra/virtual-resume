# Roadmap de Desenvolvimento - Curriculo Virtual (Tradicional + Adventure 3D)

Baseado em `curriculo-estrutura.md`, este documento define uma estrategia unica de execucao, com foco em MVP rapido, arquitetura escalavel e ordem correta de dependencias.

## 1. Objetivo do Projeto

Construir um portfolio web com dois modos:

1. `Tradicional`: curriculo classico, SEO-friendly e print-friendly.
2. `Adventure`: mapa interativo 3D com personagem, predios clicaveis e popups com experiencias profissionais.

## 2. Estrategia Geral (Decisao Arquitetural)

Stack principal recomendada:

- `Vite + React + TypeScript` para base unica do projeto.
- `React Router` para rotas (`/`, `/traditional`, `/adventure`).
- `Three.js + @react-three/fiber + @react-three/drei` para o modo Adventure.
- `cannon-es` para colisao/fisica simples.
- `Tailwind CSS` para velocidade de UI + `Framer Motion` para microanimacoes.
- `GSAP` para animacoes cinematograficas (landing e camera).
- `Zod` para validar JSON de experiencias.
- `Zustand` para estado global leve (audio, modo, estado de popup).

Motivo da escolha:

- Uma unica app reduz complexidade de deploy.
- React acelera desenvolvimento de UI, popups e componentes compartilhados.
- R3F facilita integrar 3D sem perder controle do ecossistema Three.js.

## 3. Ordem Correta das Dependencias

Instalar por camadas para evitar retrabalho:

1. Camada base: runtime, bundler, linguagem.
2. Camada app shell: rotas, estado, utilitarios.
3. Camada UI: estilo e animacao.
4. Camada 3D: engine, helpers e fisica.
5. Camada dados: validacao de schema.
6. Camada qualidade: lint, format, testes.
7. Camada deploy: CI/CD.

## 4. Bibliotecas a Instalar (em Ordem)

## 4.1 Bootstrap do projeto

```bash
npm create vite@latest curriculo-virtual -- --template react-ts
cd curriculo-virtual
npm install
```

## 4.2 Shell da aplicacao

```bash
npm install react-router-dom zustand zod clsx
```

## 4.3 UI e animacao (modo Landing + Tradicional)

```bash
npm install framer-motion gsap
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 4.4 Engine 3D (Adventure)

```bash
npm install three @react-three/fiber @react-three/drei cannon-es howler
npm install -D @types/three
```

## 4.5 Qualidade e padrao de codigo

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install -D husky lint-staged
```

## 4.6 Testes (unitario + e2e)

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D playwright
npx playwright install
```

## 4.7 CI/CD

Sem biblioteca obrigatoria extra. Usar GitHub Actions com scripts do `package.json`.

## 5. Estrutura de Pastas Recomendada

```text
curriculo-virtual/
|- public/
|  |- assets/
|  |  |- models/
|  |  |- textures/
|  |  |- audio/
|  |  |- logos/
|  |  `- icons/
|- src/
|  |- app/
|  |  |- router/
|  |  |- providers/
|  |  `- styles/
|  |- shared/
|  |  |- components/
|  |  |- ui/
|  |  |- hooks/
|  |  |- utils/
|  |  `- constants/
|  |- modules/
|  |  |- landing/
|  |  |  |- components/
|  |  |  |- sections/
|  |  |  `- landing.page.tsx
|  |  |- traditional/
|  |  |  |- components/
|  |  |  |- sections/
|  |  |  `- traditional.page.tsx
|  |  `- adventure/
|  |     |- engine/
|  |     |- world/
|  |     |- entities/
|  |     |- systems/
|  |     |- ui/
|  |     |- hooks/
|  |     `- adventure.page.tsx
|  |- data/
|  |  |- experiences.schema.ts
|  |  `- experiences.json
|  |- tests/
|  |- main.tsx
|  `- vite-env.d.ts
|- scripts/
|  |- optimize-assets.mjs
|  `- validate-data.mjs
|- .github/workflows/
|  |- ci.yml
|  `- deploy.yml
|- package.json
`- roadmap.md
```

## 6. Regras de Desenvolvimento

Regras tecnicas:

1. Tudo em `TypeScript` (sem `any` sem justificativa).
2. Cada modulo (`landing`, `traditional`, `adventure`) nao importa componentes internos de outro modulo.
3. Dados de experiencias sao fonte unica em `src/data/experiences.json`.
4. Todo acesso a dados JSON passa por validacao `Zod`.
5. Sem asset 3D acima de 5 MB por arquivo apos otimizacao.
6. Sem merge com lint/test quebrando.

Regras de UX/performance:

1. Desktop: alvo `60 FPS` no Adventure.
2. Mobile: minimo aceitavel `30 FPS`.
3. Fallback automatico para modo tradicional quando WebGL nao suportado.
4. Acessibilidade minima: contraste AA, foco visivel, navegacao por teclado nos popups.

Regras de fluxo de trabalho:

1. Branch por feature (`feat/landing`, `feat/adventure-core`, etc.).
2. Commits curtos e semanticos (`feat`, `fix`, `chore`, `refactor`).
3. PRs pequenas (maximo recomendado: 400 linhas alteradas).
4. Sempre atualizar checklist da fase antes de avancar.

## 7. Processo de Desenvolvimento (Passo a Passo)

## Fase 0 - Planejamento (Semana 1)

Dependencias previas: nenhuma.

Passos:

1. Definir identidade visual de cada modo.
2. Escolher direcao artistica do Adventure (low-poly 3D recomendado).
3. Listar experiencias profissionais e mapear para predios.
4. Criar wireframes da landing, tradicional e popup.
5. Definir escopo do MVP (1 predio, 1 popup, 1 personagem).

Entrega:

- Documento de escopo + wireframes + backlog inicial.

## Fase 1 - Setup Base do Projeto (Semana 1)

Dependencias previas: Fase 0.

Passos:

1. Criar projeto Vite React TS.
2. Configurar Tailwind, ESLint, Prettier e scripts `lint`, `test`, `build`.
3. Configurar React Router com 3 rotas principais.
4. Criar layout base e tema global.
5. Configurar CI inicial (lint + test + build).

Entrega:

- Projeto sobe localmente com rotas vazias e pipeline CI ativa.

## Fase 2 - Dados Compartilhados e UI Base (Semana 2)

Dependencias previas: Fase 1.

Passos:

1. Criar `experiences.schema.ts` com Zod.
2. Criar `experiences.json` inicial.
3. Criar componentes compartilhados (`Button`, `Card`, `Modal`, `SectionTitle`).
4. Criar store global com Zustand (audio, popup, modo ativo).
5. Criar tokens visuais (cores, espacamento, tipografia).

Entrega:

- Base de dados validada e design system inicial pronto.

## Fase 3 - Landing Page (Semana 2-3)

Dependencias previas: Fase 2.

Passos:

1. Implementar hero com identidade pessoal.
2. Implementar 2 cards de navegacao (`Tradicional` e `Adventure`).
3. Adicionar animacoes com Framer Motion e GSAP.
4. Adicionar preview visual do Adventure (canvas leve ou video loop otimizado).
5. Garantir responsividade total.

Entrega:

- Landing pronta, navegacao funcionando e boa experiencia mobile.

## Fase 4 - Modo Tradicional (Semana 3-4)

Dependencias previas: Fase 2 e Fase 3.

Passos:

1. Implementar secoes (Resumo, Experiencias, Habilidades, Educacao, Projetos).
2. Criar timeline animada de experiencias.
3. Implementar modo claro/escuro.
4. Implementar CSS print-friendly.
5. Gerar botao de download de PDF.
6. Adicionar SEO (meta tags, Open Graph, schema.org basico).

Entrega:

- Curriculo tradicional completo, indexavel e imprimivel.

## Fase 5 - Core do Adventure 3D (Semana 4-6)

Dependencias previas: Fase 2.

Passos:

1. Montar cena base Three.js (camera, luz, renderer, loop).
2. Criar terreno e grid de posicionamento.
3. Implementar personagem com movimentacao WASD.
4. Implementar camera seguindo personagem com suavizacao.
5. Implementar colisao basica com `cannon-es`.
6. Implementar carregamento de predios a partir de JSON.

Entrega:

- Mapa navegavel com personagem e predios renderizados.

## Fase 6 - Interacao e Popups (Semana 6-7)

Dependencias previas: Fase 5.

Passos:

1. Implementar raycasting para hover e click em predios.
2. Destacar predio interativo (outline, emissive ou shader leve).
3. Implementar popup em overlay HTML com dados dinamicos.
4. Fechar popup com ESC, clique fora e botao.
5. Sincronizar popup com estado global (Zustand).

Entrega:

- Experiencias acessiveis pelo mundo 3D com UX consistente.

## Fase 7 - Polimento, Audio e Otimizacao (Semana 7-9)

Dependencias previas: Fase 6.

Passos:

1. Adicionar audio ambiente com `howler`.
2. Adicionar loading screen com progresso real de assets.
3. Implementar post-processing moderado (bloom e color grading leve).
4. Otimizar modelos/texturas (Draco, WebP, atlas quando aplicavel).
5. Implementar lazy loading por regiao.
6. Validar FPS em desktop e mobile.

Entrega:

- Adventure polido, com performance controlada e tempo de carga reduzido.

## Fase 8 - Testes, QA e Deploy (Semana 9-10)

Dependencias previas: Fases 3, 4, 7.

Passos:

1. Cobrir utilitarios e schema com Vitest.
2. Criar testes e2e de fluxos criticos com Playwright.
3. Configurar deploy na Vercel.
4. Publicar assets pesados em Cloudflare R2 (ou equivalente).
5. Configurar cache e compressao.
6. Criar `sitemap.xml`, `robots.txt` e revisar SEO final.

Entrega:

- Projeto publicado, testado e com esteira de entrega automatizada.

## 8. Ordem de Implementacao do MVP (2 semanas)

Executar exatamente nesta ordem:

1. Setup base (Vite + Router + Tailwind + lint).
2. Landing simples com 2 botoes.
3. Tradicional com experiencias basicas.
4. Adventure minimo:
   - chao simples
   - 1 predio clicavel
   - 1 popup
   - personagem com WASD
5. Deploy inicial na Vercel.

Regra do MVP:

- Nao adicionar efeitos avancados antes de validar navegacao e legibilidade do conteudo.

## 9. Checklist de Pronto para Lancamento

1. `npm run lint` sem erros.
2. `npm run test` sem falhas.
3. `npm run build` concluido.
4. Lighthouse >= 90 em Performance/SEO/A11y na landing e no tradicional.
5. Adventure com FPS estavel no desktop alvo.
6. Fallback para ambiente sem WebGL validado.
7. Links de contato e PDF funcionando.

## 10. Scripts Recomendados no package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

## 11. Riscos e Mitigacoes

1. Queda de performance no mobile.
   - Mitigar com simplificacao de cena, menos luzes dinamicas e fallback.
2. Escopo crescer cedo demais.
   - Mitigar com gate de MVP (sem polimento antes do fluxo principal funcionar).
3. Assets pesados travando carregamento.
   - Mitigar com compressao, lazy loading e limites de tamanho por arquivo.
4. Acoplamento entre modos.
   - Mitigar com separacao por modulos e contratos de dados compartilhados.

## 12. Resultado Esperado

Ao final deste roadmap, o projeto tera:

1. Portfolio tradicional profissional e otimizado para recrutadores.
2. Experiencia Adventure memoravel para diferenciar sua marca pessoal.
3. Arquitetura sustentavel para evolucao continua sem retrabalho estrutural.
