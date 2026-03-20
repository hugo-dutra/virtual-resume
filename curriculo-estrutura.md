# 🗺️ Roadmap — Currículo Web Interativo com Modo Adventure 3D

> Projeto: Portfolio profissional com dois modos de navegação — **Tradicional** e **Adventure (RPG/Diablo-style)**

---

## 🧭 Visão Geral da Arquitetura

```
portfolio-web/
├── landing/          → Página de entrada com escolha de modo
├── traditional/      → Currículo clássico (HTML/CSS)
├── adventure/        → Mapa 3D interativo (Three.js / Phaser / Godot Web Export)
│   ├── engine/       → Loop do jogo, câmera, controles
│   ├── world/        → Mapa, tiles, prédios, NPCs
│   ├── assets/       → Sprites, modelos 3D, texturas, sons
│   └── data/         → JSON com experiências profissionais
└── shared/           → Componentes UI reutilizáveis (popups, fontes, cores)
```

---

## 🏁 Fase 0 — Planejamento e Design (Semana 1–2)

### Objetivos

* Definir identidade visual dos dois modos
* Mapear todas as experiências profissionais que virarão "prédios"
* Esboçar o mapa do Adventure (cidades, regiões temáticas por área de atuação)
* Definir a paleta de cores e estilo artístico (pixel art isométrica? Low-poly 3D? Top-down como Diablo?)

### Entregas

* [ ] Wireframe da Landing Page (Figma ou papel mesmo)
* [ ] Esboço do mapa Adventure com localização dos prédios
* [ ] Lista de todas as experiências e o que cada popup vai mostrar
* [ ] Decisão do estilo visual: **pixel art isométrica** (mais acessível) ou **low-poly 3D** (mais impactante)

### Ferramentas de Design

| Ferramenta | Uso                                         |
| ---------- | ------------------------------------------- |
| Figma      | Wireframes, UI dos popups                   |
| Aseprite   | Pixel art / sprites (se escolher pixel art) |
| Blender    | Modelagem 3D low-poly (se escolher 3D)      |
| Kenney.nl  | Assets gratuitos para prototipagem          |

---

## 🌐 Fase 1 — Landing Page (Semana 2–3)

### Stack Recomendada

* **HTML + CSS + JavaScript puro** (ou Next.js/Astro para SEO e performance)
* **GSAP** para animações de entrada
* **Three.js** para um preview 3D animado no fundo (teaser do modo Adventure)

### Funcionalidades

* [ ] Logo / Nome + título profissional
* [ ] Dois cards de seleção: "Tradicional" e "Adventure"
* [ ] Animação ao hover nos cards
* [ ] Preview animado do mapa 3D como background
* [ ] Música ambiente opcional (toggle on/off)
* [ ] Responsivo para mobile

### Referências de Inspiração

* Bruno Simon (brunosimon.io) — referência máxima de portfolio 3D na web
* Midwam — storytelling visual interativo

---

## 📄 Fase 2 — Modo Tradicional (Semana 3–4)

### Stack

* **HTML + CSS + JavaScript** ou **React + Tailwind**
* **Framer Motion** para micro-animações suaves

### Seções

* [ ] Header com foto e contato
* [ ] Resumo profissional
* [ ] Experiências (timeline vertical animada)
* [ ] Habilidades (barras ou tags)
* [ ] Educação
* [ ] Projetos destacados
* [ ] Botão de download PDF

### Diferenciais de Design

* Timeline com linha do tempo visual
* Cada card de experiência com cor da empresa / logo
* Modo claro/escuro
* Print-friendly (CSS @media print)

---

## 🎮 Fase 3 — Motor do Adventure (Semana 4–8) ⭐ CORE

Esta é a fase mais complexa e importante do projeto.

### Decisão Arquitetural — Qual engine usar?

#### Opção A: Three.js (Recomendada para alta qualidade 3D)

```
Prós:  Qualidade visual excelente, total controle, WebGL nativo
Contras: Mais código para escrever, física manual
Ideal para: Low-poly 3D, estilo Monument Valley / mini Diablo 3D
```

#### Opção B: Phaser 3 (Recomendada para pixel art)

```
Prós:  Maturidade, comunidade enorme, tilemaps nativos
Contras: 2D/isométrico, não é "verdadeiro 3D"
Ideal para: Visual estilo Stardew Valley, Diablo 1/2
```

#### Opção C: Godot 4 (Web Export)

```
Prós:  Engine completa, física, animações, mais fácil de desenvolver
Contras: Bundle maior (~30MB), menos controle sobre UI web
Ideal para: Quem já conhece Godot, projeto mais robusto
```

#### Opção D: Babylon.js

```
Prós:  Similar ao Three.js, mas com mais utilitários built-in (física, colisões)
Contras: Bundle maior
Ideal para: 3D com física e colisões sem muito código
```

> **✅ Recomendação final:** `Three.js + Cannon.js (física)` para máxima qualidade visual web, ou `Phaser 3` se quiser pixel art isométrica mais rápida de implementar.

---

### Sub-fases do Adventure

#### 3.1 — Setup do Projeto (Semana 4)

```bash
# Estrutura com Vite (bundler moderno e rápido)
npm create vite@latest portfolio-adventure -- --template vanilla
cd portfolio-adventure
npm install three @types/three
npm install cannon-es          # física
npm install gsap               # animações de câmera
```

* [ ] Configurar Vite como bundler
* [ ] Configurar estrutura de pastas
* [ ] Setup do renderer Three.js (WebGLRenderer, Scene, Camera)
* [ ] Loop de animação básico (requestAnimationFrame)
* [ ] Controles de câmera isométrica (OrbitControls configurado)

#### 3.2 — Mapa Base (Semana 4–5)

* [ ] Criar terreno flat (PlaneGeometry com textura de grama/pedra)
* [ ] Sistema de grid para posicionar prédios
* [ ] Iluminação ambiente (AmbientLight + DirectionalLight para sombras)
* [ ] Skybox / gradiente de céu
* [ ] Névoa atmosférica (THREE.Fog)
* [ ] Água animada (shader simples) se o mapa tiver rios/lagos

```javascript
// Exemplo: Setup básico Three.js
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

const camera = new THREE.OrthographicCamera(...); // Câmera isométrica
// ou PerspectiveCamera para look mais moderno

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

#### 3.3 — Personagem e Movimento (Semana 5–6)

* [ ] Importar modelo do personagem (GLTF/GLB)
* [ ] Animações: idle, walk, interact (usando AnimationMixer)
* [ ] Controles: WASD + mouse click para mover (pathfinding simples)
* [ ] Câmera seguindo o personagem suavemente (lerp)
* [ ] Colisão simples com prédios (bounding boxes)

```javascript
// Controles básicos de movimento
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);

// No loop:
if (keys['KeyW']) player.position.z -= speed * delta;
if (keys['KeyS']) player.position.z += speed * delta;
```

#### 3.4 — Prédios / Locais de Trabalho (Semana 6–7)

* [ ] Criar ou importar modelos de prédios (GLTF)
* [ ] Sistema de data JSON para configurar cada prédio:

```json
{
  "buildings": [
    {
      "id": "empresa-alpha",
      "name": "Empresa Alpha",
      "model": "assets/models/office_building.glb",
      "position": { "x": 10, "z": -5 },
      "scale": 1.5,
      "color": "#2563EB",
      "period": "Jan 2020 – Dez 2022",
      "role": "Senior Frontend Developer",
      "description": "Liderei o redesign...",
      "tech": ["React", "TypeScript", "AWS"],
      "logo": "assets/logos/empresa-alpha.png",
      "highlights": [
        "Reduzi o tempo de carregamento em 40%",
        "Liderei equipe de 5 devs"
      ]
    }
  ]
}
```

* [ ] Carregar prédios dinamicamente do JSON
* [ ] Hover effect: highlight/outline no prédio ao passar o mouse
* [ ] Raycasting para detectar clique no prédio

```javascript
// Raycasting para detectar clique
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(buildings);
  if (intersects.length > 0) openPopup(intersects[0].object.userData);
});
```

#### 3.5 — Sistema de Popup (Semana 7)

* [ ] Design do popup em HTML/CSS (overlay sobre o canvas)
* [ ] Animação de entrada (GSAP ou CSS transitions)
* [ ] Conteúdo dinâmico vindo do JSON
* [ ] Fechar ao clicar fora ou pressionar ESC
* [ ] Scroll interno para experiências longas

```css
/* Estilo sugerido para popup */
.popup-overlay {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.7);
}
.popup-card {
  background: linear-gradient(135deg, #1e1e2e, #2d2d44);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}
```

#### 3.6 — Polimento Visual (Semana 8)

* [ ] Post-processing: bloom, color grading (THREE.EffectComposer)
* [ ] Partículas ambiente (faíscas, folhas, poeira)
* [ ] Animações dos prédios (placas oscilando, luzes piscando)
* [ ] Sons ambiente (passos, vento, música de fundo)
* [ ] Indicadores visuais nos prédios interativos (ícone flutuante "!")
* [ ] Loading screen com barra de progresso

---

## 🗂️ Fase 4 — Sistema de Assets (Semana 8–9)

### Formatos Suportados

| Tipo       | Formato Recomendado                       |
| ---------- | ----------------------------------------- |
| Modelos 3D | `.glb`/`.gltf`(compactado com Draco)  |
| Texturas   | `.webp`(melhor compressão) ou `.png` |
| Sprites 2D | `.png`com spritesheet                   |
| Áudio     | `.ogg`+`.mp3`(fallback)               |

### Pipeline de Assets

```
Blender → exportar .glb → gltf-transform (otimizar) → pasta assets/
Aseprite → exportar spritesheet .png → TextureAtlas no Phaser
Audacity → exportar .ogg/.mp3 → pasta assets/audio/
```

### Otimizações Essenciais

* [ ] Compressão Draco para modelos 3D (reduz 70-80% do tamanho)
* [ ] Texture atlas para múltiplas texturas (reduz draw calls)
* [ ] LOD (Level of Detail) para objetos distantes
* [ ] Lazy loading de assets por região do mapa

```bash
# Otimizar modelos com gltf-pipeline
npm install -g gltf-pipeline
gltf-pipeline -i model.glb -o model-compressed.glb --draco.compressionLevel 10
```

---

## 🚀 Fase 5 — Deploy e Performance (Semana 9–10)

### Stack de Deploy

| Serviço                 | Uso                           | Custo        |
| ------------------------ | ----------------------------- | ------------ |
| **Vercel**         | Hosting do site (recomendado) | Gratuito     |
| **Cloudflare R2**  | Armazenar assets 3D grandes   | Muito barato |
| **GitHub Actions** | CI/CD automático             | Gratuito     |

### Performance Web

* [ ] Code splitting (modo Traditional e Adventure em bundles separados)
* [ ] Assets com CDN (Cloudflare)
* [ ] Compressão Gzip/Brotli no servidor
* [ ] Preload do engine 3D enquanto o usuário lê a landing
* [ ] WebGL feature detection (fallback para modo traditional em devices sem suporte)
* [ ] Target: **60fps** no desktop, **30fps** aceitável no mobile

### SEO (para o modo tradicional)

* [ ] Meta tags Open Graph (preview bonito no LinkedIn)
* [ ] Schema.org para dados estruturados de emprego
* [ ] sitemap.xml
* [ ] robots.txt

---

## 📦 Stack Tecnológica Completa

### Frontend Core

```
Vite 5           → Bundler ultrarrápido
TypeScript       → Tipagem (especialmente útil para o engine 3D)
```

### 3D Engine

```
Three.js r165+   → Renderização 3D WebGL
@react-three/fiber → Se quiser integrar com React
Cannon-es        → Física (colisões)
Tween.js / GSAP  → Animações de câmera e UI
drei (r3f)       → Helpers para Three.js
```

### UI / Landing

```
HTML + CSS puro  → Landing page (leve e rápido)
Tailwind CSS     → Modo Traditional
Framer Motion    → Animações no modo Traditional
```

### Assets

```
Blender 4+       → Modelagem 3D
Aseprite         → Pixel art (alternativa)
Kenney Assets    → Assets gratuitos prontos
gltf-transform   → Otimização de modelos
```

### Audio

```
Howler.js        → Gerenciamento de áudio web
Tone.js          → Música procedural (opcional)
```

### Build & Deploy

```
Vite             → Build otimizado
Vercel           → Deploy
GitHub Actions   → CI/CD
```

---

## 📅 Cronograma Resumido

| Semana | Fase             | Entrega                                     |
| ------ | ---------------- | ------------------------------------------- |
| 1–2   | Planejamento     | Wireframes, mapa esboçado, assets listados |
| 2–3   | Landing Page     | Página de entrada funcional e animada      |
| 3–4   | Modo Tradicional | Currículo clássico completo e responsivo  |
| 4      | Setup Adventure  | Projeto configurado, Three.js rodando       |
| 4–5   | Mapa Base        | Terreno, iluminação, câmera isométrica  |
| 5–6   | Personagem       | Movimento, animações, câmera seguindo    |
| 6–7   | Prédios         | Modelos, dados JSON, raycasting, hover      |
| 7      | Popups           | UI de popup dinâmico e animado             |
| 8      | Polimento        | Post-processing, partículas, sons          |
| 8–9   | Assets           | Pipeline de import, otimização            |
| 9–10  | Deploy           | Vercel, CDN, SEO, performance               |

**Estimativa total: 10–12 semanas** (trabalhando ~15h/semana)

---

## ⚠️ Riscos e Mitigações

| Risco                       | Probabilidade | Mitigação                                              |
| --------------------------- | ------------- | -------------------------------------------------------- |
| Performance ruim no mobile  | Alta          | Modo fallback 2D, detectar WebGL                         |
| Assets 3D muito pesados     | Média        | Draco compression, lazy loading                          |
| Complexidade do pathfinding | Média        | Usar movimento simples WASD primeiro, pathfinding depois |
| Compatibilidade de browsers | Baixa         | Three.js suporta todos os browsers modernos              |
| Escopo crescente            | Alta          | MVP primeiro (1 prédio funcionando), depois expande     |

---

## 🎯 MVP — O que construir PRIMEIRO

Antes de tudo, valide o conceito com um  **MVP em 2 semanas** :

1. Landing page com dois botões
2. Modo Traditional com suas experiências (HTML puro)
3. Modo Adventure com:
   * Plano simples (chão verde)
   * UM prédio clicável
   * Popup funcionando com dados fictícios
   * Personagem se movendo com WASD

Se o MVP parecer certo, aí você investe no polimento visual e nos outros prédios.

---

## 🔗 Referências Imperdíveis

* **[Bruno Simon Portfolio](https://bruno-simon.com/)** — O melhor exemplo de portfolio 3D na web
* **[Three.js Journey](https://threejs-journey.com/)** — Melhor curso de Three.js (Bruno Simon)
* **[Kenney.nl](https://kenney.nl/)** — Assets gratuitos de altíssima qualidade
* **[Sketchfab](https://sketchfab.com/)** — Modelos 3D prontos (muitos gratuitos)
* **[pmndrs/drei](https://github.com/pmndrs/drei)** — Helpers incríveis para Three.js + React
* **[GSAP](https://greensock.com/gsap/)** — Animações suaves profissionais

---

*Roadmap criado para projeto de portfolio interativo com modo Adventure 3D estilo Diablo.*
