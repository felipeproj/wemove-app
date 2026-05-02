# Histórico de Bugs — wemove-app

Registro de bugs identificados em produção ou testes, com análise e correção aplicada.
Formato: severidade (🔴 crítico · 🟠 alto · 🟡 médio · 🟢 baixo)

---

## BUG-APP-001 🔴 Tela de loading infinita ao acessar app.wemoveapp.co diretamente
**Data:** 2026-04-25 / 2026-05-02  
**Commits de correção:** `d348bff`, `030ef12`, `ffc7b63`

### Ocorrência
Ao acessar `app.wemoveapp.co` diretamente (incluindo em aba anônima), o app ficava preso em um spinner infinito. A única forma de recuperar era fazer "Clear site data" no DevTools → Application → Storage.

### Análise
**Causa 1 — Conflito no Service Worker (commits `d348bff` e `030ef12`):**  
A configuração do Workbox foi alterada em duas etapas que se contradiziam:
- `html` foi removido do `globPatterns` (não precacheia o HTML)  
- `navigateFallback: 'index.html'` foi mantido (SW intercepta navegações e tenta servir `index.html` do precache)

Resultado: o SW interceptava todas as navegações mas não encontrava `index.html` no precache → página travada antes do React montar.

**Causa 2 — authLoading sem tratamento de erro (commit `ffc7b63`):**  
Em `useAuthStore.init()`, a chamada `supabase.auth.getSession()` não tinha `.catch()` nem timeout. Se a Promise rejeitava ou ficava pendente (race condition com SW assumindo controle via `clientsClaim`), `authLoading` ficava `true` para sempre. A `LandingPage` renderiza apenas um spinner enquanto `authLoading === true`, sem fallback.

### Correção
1. `html` restaurado ao `globPatterns` — `index.html` está no precache e `navigateFallback` funciona corretamente.
2. Removida regra de runtime para requests `navigate` (conflitava com `navigateFallback`).
3. `skipWaiting: true` + `clientsClaim: true` + `cleanupOutdatedCaches: true` adicionados para garantir que novos deploys assumam imediatamente.
4. Em `useAuthStore.init()`: adicionados `.catch()`, `try/catch` no `onAuthStateChange`, e **failsafe de 5 segundos** que força `authLoading: false` caso a Promise nunca resolva.

---

## BUG-APP-002 🟠 CSP bloqueando Google Fonts via Service Worker
**Data:** 2026-04-25  
**Commit de correção:** `0c5c6ba`

### Ocorrência
Após adição de security headers no `vercel.json`, o app ficava em branco com erros no console: `"Connecting to 'https://fonts.googleapis.com/...' violates Content Security Policy directive: connect-src"`.

### Análise
O Service Worker (Workbox) faz requisições `fetch()` para cachear as fontes do Google Fonts. Essas requisições passam pela diretiva `connect-src` do CSP, não pela `style-src`. A `connect-src` configurada não incluía `fonts.googleapis.com` nem `fonts.gstatic.com`, então o SW não conseguia cachear as fontes e o app não renderizava.

Problema adicional: `payment=()` estava na `Permissions-Policy`, o que bloquearia redirecionamentos para o Stripe Checkout.

### Correção
- Adicionados `https://fonts.googleapis.com` e `https://fonts.gstatic.com` ao `connect-src`.
- Removido `payment=()` da `Permissions-Policy`.

---

## BUG-APP-003 🟡 Classe CSS `.grad` indefinida — modal de upgrade sem gradiente e botão invisível
**Data:** 2026-04-25  
**Commit de correção:** `0e3d5df`

### Ocorrência
O modal de upgrade exibia espaços em branco no lugar do header e o botão "Quero o Essencial" aparecia sem texto.

### Análise
O componente `UpgradeModal.tsx` usava a classe CSS `grad` tanto no header quanto no botão do plano featured (`grad text-white`). A classe nunca foi definida em `index.css` nem no `tailwind.config.js`. Sem o background gradient, o texto branco (`text-white`) ficava invisível sobre o fundo branco do card/modal.

### Correção
Adicionada `.grad { background: linear-gradient(135deg, #3B82F6, #8B5CF6); }` na camada `@layer utilities` do `src/index.css`, consistente com a identidade visual WeMove (azul → roxo).

---

## BUG-APP-004 🟠 Usuário perde sessão e lista ao retornar do Stripe
**Data:** 2026-05-02  
**Commit de correção:** `a1a82f4`

### Ocorrência
Após cancelar ou concluir o pagamento no Stripe, o usuário era redirecionado para `app.wemoveapp.co/?upgrade=cancelled` (ou `?upgrade=success`) sem o token da lista. O app mostrava a LandingPage como se o usuário não estivesse logado, exigindo novo login e reinserção do código da lista.

### Análise
As URLs `success_url` e `cancel_url` geradas no checkout Stripe não incluíam o parâmetro `?lista=TOKEN`. Sem esse parâmetro, `initList()` detecta ausência de token e define `needsSetup: true`, exibindo a LandingPage. A sessão do Supabase ainda existia, mas o fluxo de UI não reconhecia que o usuário tinha uma lista ativa.

### Correção
1. `UpgradeModal` passa o `listToken` atual do store para `paymentApi.createCheckout(plan, listToken)`.
2. Backend inclui `&lista=${list_token}` nas URLs de retorno quando disponível.
3. `App.tsx` limpa os params `?upgrade=*` da URL via `history.replaceState` sem causar reload.
4. `ListaPage` exibe toast de boas-vindas ao plano quando detecta `?upgrade=success` na URL.

---

## BUG-APP-005 🟢 Build Vercel falhando por variáveis TypeScript não utilizadas
**Data:** 2026-04-25  
**Commit de correção:** `f22877f`

### Ocorrência
Deploy no Vercel rejeitado com erros:
```
error TS6133: 'onOpenAdmin' is declared but its value is never read
error TS6133: 'role' is declared but its value is never read
```

### Análise
Refatoração anterior moveu o acesso admin para o dropdown do header, mas deixou `onOpenAdmin` na interface `Props` e `role` no corpo de `UserAreaPage.tsx`. O TypeScript no modo strict do Vite trata variáveis não utilizadas como erro de build.

### Correção
Removidas as props e variáveis não utilizadas de `UserAreaPage.tsx` e o pass-through correspondente em `LandingPage.tsx`.
