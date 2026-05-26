# NextRep Frontend — AI Instructions

## Product Philosophy

**Primary goal:** logar um treino deve ser mais rápido do que usar WhatsApp ou Notas.

Antes de qualquer feature, pergunte: *isso torna o logging mais rápido ou mais lento?*

---

## Stack

- React 19 + Vite + TypeScript
- React Router v6
- Zustand (estado da sessão ativa)
- Tailwind CSS v4

---

## Estrutura

```
src/
  data/mock.ts          # Dados mock que espelham as entidades do backend
  store/session.ts      # Zustand: estado da sessão de treino ativa
  pages/
    PlansPage.tsx       # /plans — lista de planos
    PlanDetailPage.tsx  # /plans/:id — detalhe do plano com dias/exercícios
    WorkoutPage.tsx     # /workout/:dayId — sessão ativa de treino
  components/
    ExerciseCard.tsx    # Card de exercício com suas séries
    SetRow.tsx          # Uma linha: peso / reps / RIR + check
```

---

## Regras de UI/UX

- **Dark theme sempre** — fundo `zinc-950`, texto `zinc-100`
- **Accent `emerald-500`** para ações primárias e checks
- **Max-width 430px** centralizado — simula celular no browser
- **Touch targets mínimos `min-h-[48px]`** em todos os botões interativos
- **Prefill agressivo** — campos mostram o valor anterior em `zinc-400` até o usuário editar
- Sem animações desnecessárias; transições só em `transition-colors`
- Sem comentários desnecessários no código

## Anti-patterns

Evitar:
- Modais excessivos
- Menus profundos
- Navegação com mais de 2 níveis de profundidade
- Charts ou dashboards durante o treino
- Animações decorativas

---

## Estado de sessão (Zustand)

O store em `src/store/session.ts` gerencia toda a sessão ativa:
- `startSession(dayId, exercises)` — inicia e faz prefill do histórico
- `addSet(exerciseId)` — adiciona série com prefill da última
- `updateSet(...)` — atualiza campo; remove flag `prefilled`
- `toggleDone(...)` — marca/desmarca série como feita
- `finishSession()` — limpa estado

---

## Running

```bash
npm install
npm run dev
# http://localhost:5173
```

Fluxo principal: `/plans` → selecionar PPL → clicar "Ver plano" → clicar "Iniciar" em Push → logar séries → "Finalizar treino"
