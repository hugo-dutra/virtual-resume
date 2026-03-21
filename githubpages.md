# Publicacao no GitHub Pages (Passo a Passo)

Este documento descreve todo o processo para publicar o projeto no GitHub Pages com CI/CD via GitHub Actions.

## 1) Pre-requisitos

- Git instalado.
- Node.js 22 (recomendado, igual ao workflow).
- npm instalado.
- Repositorio remoto no GitHub configurado.

Opcional:
- GitHub CLI (`gh`) para acompanhar pipelines e fazer login via terminal.

## 2) Estrutura de CI/CD usada neste projeto

Arquivos:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

Fluxo atual:
- `ci.yml`: roda em `push`/`pull_request` (lint, testes, build e e2e).
- `deploy.yml`: roda em `push` para `main`/`master` e publica no GitHub Pages.

## 3) Configuracao do repositorio no GitHub (primeira vez)

1. Deixe o repositorio como `Public`.
2. Em `Settings > Pages`:
   - `Build and deployment`: selecione `GitHub Actions`.
3. Confirme que a branch de deploy e `master` (ou `main`, se trocar depois).

### 3.1 Mudar visibilidade via CLI (Public/Private)

Para alterar a visibilidade pelo terminal com `gh`, use:

```bash
gh repo edit hugo-dutra/virtual-resume --visibility private --accept-visibility-change-consequences
```

Para validar:

```bash
gh repo view hugo-dutra/virtual-resume --json visibility
```

## 4) Publicacao (rotina normal)

No terminal, na raiz do projeto:

```bash
git checkout master
git pull origin master
npm ci
npm run build
git add .
git commit -m "feat: atualizacoes"
git push origin master
```

O `push` dispara automaticamente:
- CI
- Deploy GitHub Pages

## 5) URL final do site

Padrao do GitHub Pages para este repo:

- `https://hugo-dutra.github.io/virtual-resume/`

Observacao:
- O workflow ja faz build com `--base "/virtual-resume/"`, que e obrigatorio para funcionar no subpath do Pages.

## 6) Como verificar se a publicacao funcionou

### Pelo navegador

1. Abra `Actions` no repositorio.
2. Veja os workflows mais recentes:
   - `CI`
   - `Deploy GitHub Pages`
3. Ambos devem estar verdes (`success`).

### Pelo terminal (sem `gh`)

Use API publica do GitHub:

```powershell
$headers = @{"Accept"="application/vnd.github+json";"User-Agent"="local-check"}
Invoke-RestMethod -Headers $headers -Uri "https://api.github.com/repos/hugo-dutra/virtual-resume/actions/runs?per_page=5"
```

### Pelo terminal (com `gh`)

```bash
gh auth login
gh run list --repo hugo-dutra/virtual-resume
gh run view <run-id> --repo hugo-dutra/virtual-resume --log
```

## 7) Troubleshooting

### 7.1 Deploy nao inicia

- Verifique se o push foi para `master` ou `main`.
- Verifique se `deploy.yml` existe na branch enviada.

### 7.2 Deploy falha no build

Rode local antes do push:

```bash
npm ci
npm run lint
npm run test
npm run build
```

Corrija erros e envie novo commit.

### 7.3 Site abre em branco

- Confirme `--base "/virtual-resume/"` no passo de build do workflow.
- Confirme que `404.html` e criado a partir de `index.html` (SPA fallback).
- Limpe cache do navegador e teste novamente.

### 7.4 Assets nao carregam

- Arquivos estaticos devem estar em `public/assets/...`.
- Use caminhos resolvidos via utilitario do projeto quando aplicavel.
- Confira nomes com maiusculas/minusculas exatamente iguais.

### 7.5 Som nao toca

- Browsers podem bloquear autoplay sem interacao.
- Clique no botao de audio (`Ambient audio` ou `Audio`) para liberar.
- Verifique se o arquivo existe em `public/assets/audio/`.

## 8) Publicar manualmente sem alterar codigo (rebuild)

Se precisar forcar novo deploy sem mudancas relevantes:

```bash
git checkout master
git pull origin master
git commit --allow-empty -m "chore: trigger pages deploy"
git push origin master
```

## 9) Checklist rapido antes de divulgar

1. `npm run build` passou local.
2. Push em `master` feito.
3. `Deploy GitHub Pages` com `success`.
4. URL publicada abre sem erro:
   - `https://hugo-dutra.github.io/virtual-resume/`
5. Testado no celular e desktop.

---

Se no futuro trocar o nome do repositorio, atualize:
- URL final do Pages.
- Valor de `--base` no workflow de deploy.
