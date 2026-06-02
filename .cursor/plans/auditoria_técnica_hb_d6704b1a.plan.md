---
name: Auditoria Técnica hb
overview: Análise técnica completa do repositório Hexa Battle — jogo dungeon crawler browser em TypeScript/React/SVG. O relatório cobre arquitetura, code smells, segurança, performance, testes e dívida técnica com itens priorizados.
todos: []
isProject: false
---

# Relatório de Análise Técnica — Hexa Battle

## 1. Resumo Executivo

**Estado geral:** Projeto pessoal de qualidade razoável para seu escopo, com engine de jogo bem separada da UI. Porém apresenta ausência total de testes, dependências criticamente desatualizadas (React 15, TypeScript 2, Webpack 2, tslint deprecated), vários bugs silenciosos, e acúmulo de dívida técnica que dificultaria qualquer crescimento ou contribuição de terceiros.

**Principais riscos:**
- Zero testes — qualquer refatoração é cega
- Bug real no fluxo de GAME_OVER (AI sempre re-lança a exceção, nunca termina limpo)
- Dependências defasadas em 4+ major versions (2017 → 2026)
- `gid()` contador global não reseta entre partidas

**Principais pontos fortes:**
- Separação clara entre engine (lógica pura) e UI (React/SVG)
- Sistema de ações extensível e bem isolado via padrão Strategy
- Algoritmo de flood-fill funcional para pathfinding
- `strictNullChecks` e `noUnusedLocals` ativos no tsconfig
- Padrão interface/implementação bem usado (`IMap`, `IAction`, `IThing`)

**Prioridade geral:** ALTA — bugs ativos + ausência de testes + dependências EOL

---

## 2. Stack Detectada

- **Linguagem:** TypeScript 2.2 (atual: 5.x — defasado 3 major versions)
- **Evidência:** `typescript: ^2.2.1` em `package.json`
- **UI Framework:** React 15.4 (atual: 18.x — 3 major versions)
- **Evidência:** `react: ^15.4.2`, `@types/react: ^15.0.16`
- **Bundler:** Webpack 2.2 (atual: 5.x)
- **Evidência:** `webpack: ^2.2.1`, usa `loaders:[]` (API deprecated, atual é `rules:[]`)
- **CSS-in-JS:** Aphrodite 1.1
- **Animações:** anime.js 2.x (atual: 3.x)
- **Persistência:** `store` lib (localStorage wrapper)
- **Linter:** tslint 4.5 — **DEPRECATED** desde 2019, substituído por ESLint
- **Testes:** **NENHUM** — `"test": "npm run lint && npm run build"` não é teste
- **CI/CD:** **NENHUM** — sem Dockerfile, sem GitHub Actions, sem nada
- **Banco de dados:** localStorage via biblioteca `store`
- **Gerenciador de pacotes:** yarn (yarn.lock presente), mas `npm run` nos scripts
- **Padrão arquitetural:** Frontend SPA com engine de jogo separada

---

## 3. Mapa do Projeto

```
src/
├── index.tsx          → Ponto de entrada (ReactDOM.render)
├── utils.ts           → Utilitários genéricos (pickRandom, debug, intervalForeach)
├── engine/            → CAMADA DE DOMÍNIO — lógica pura de jogo
│   ├── game.ts        → Estado global + event bus + game loop
│   ├── unit.ts        → Unidade de combate (HP, MP, mana, ações, status)
│   ├── hex.ts         → Matemática de hexágonos (imutável)
│   ├── map.ts         → Mapa hexagonal + flood-fill (pathfinding)
│   ├── faction.ts     → Facção (time de combate)
│   ├── thing.ts       → Entidade base (qualquer coisa no mapa)
│   ├── gid.ts         → Gerador de IDs globais
│   ├── assert.ts      → Assertion helper
│   ├── actions/       → Sistema de ações (Strategy pattern)
│   └── units/         → Definições de unidades (dados/config)
├── ai/                → CAMADA DE IA
│   ├── opponentAi.ts  → Orquestrador de turno do oponente
│   └── unitAi.ts      → Estratégia por unidade (scoring de ações)
├── content/           → CAMADA DE GERAÇÃO DE CONTEÚDO
│   ├── createLevel.ts → Geração procedural de mapas
│   └── levels.ts      → Definição de progressão de níveis
└── ui/                → CAMADA DE APRESENTAÇÃO
    ├── app.tsx        → Root component (router básico por estado)
    ├── mainStore.tsx  → Store principal (progresso, party, dinheiro)
    ├── mainView/      → Tela inicial (menu, shop, help)
    ├── stageView/     → Tela de combate (mapa SVG, sidebar, overlays)
    ├── components/    → Componentes reutilizáveis (Dialog, Bar, Icon...)
    ├── storage.ts     → Serialização/deserialização do localStorage
    └── utils/         → Store base, estilos, SVG helpers
```

**Fluxo básico de execução:**
```
index.tsx → App → (MainView | StageView)
MainView → startGame() → MainStore → createLevel() → Game
StageView → Store → Game.endTurn() → OpponentAi.performTurn() → UnitAi
```

---

## 4. Pontos Fortes

- **Separação de camadas:** engine não importa nada de React/UI. Lógica de jogo testável de forma isolada (se houvesse testes).
- **Pattern Strategy nas Actions:** cada ação é uma classe independente, fácil de adicionar novas ações sem tocar no código existente.
- **Hex como value object imutável:** `Hex` não tem setters, `add/sub/scale` retornam novos objetos. Correto para uso como chave de mapa.
- **Interface + implementação para o mapa:** `IMap` permite trocar a implementação sem afetar os consumidores.
- **`strictNullChecks`:** o compilador pega muitos erros em tempo de build.
- **Event bus no Game:** desacopla animações (UI) de eventos de jogo (engine) limpa e assincronamente.
- **`UnitAction.execute` como template method:** valida pré-condições, consome recursos, despacha resultados — as subclasses só implementam `performAction`.
- **`Store<S>` base class:** padrão razoável de store externa para componentes de classe React 15.

---

## 5. Problemas Críticos

### BUG-01 — GAME_OVER sempre re-lançado (comportamento incorreto garantido)
- **Severidade:** CRÍTICO
- **Arquivo:** `src/ai/opponentAi.ts`, linhas 82–87
- **Evidência:**
  ```ts
  } catch (e) {
    if (e === 'GAME_OVER') {
      // pass          ← não há return nem break
    }
    throw e           ← SEMPRE executado, inclusive quando e === 'GAME_OVER'
  }
  ```
- **Impacto:** O AI nunca termina o turno limpo quando o jogo acaba. A exceção se propaga para cima sem tratamento adequado.
- **Sugestão:** `if (e === 'GAME_OVER') { return }` e remover o `throw e` do fluxo normal. Melhor ainda: usar um `Error` tipado em vez de string.

### BUG-02 — Throw de string primitiva
- **Severidade:** ALTO
- **Arquivo:** `src/ai/opponentAi.ts`, linha 29
- **Evidência:** `throw 'GAME_OVER' // tslint:disable-line:no-string-throw`
- **Impacto:** Não tem stack trace, não é uma `Error`, não pode ser tipado. O linter mesmo avisa sobre isso.
- **Sugestão:** `throw new Error('GAME_OVER')` ou criar uma classe `GameOverError`.

### BUG-03 — Nome de classes errados (copy-paste sem renomear)
- **Severidade:** ALTO
- **Arquivos:** `src/engine/actions/fireBreath.ts` (linha 5), `src/engine/actions/web.ts` (linha 5)
- **Evidência:** Ambos exportam `export default class Heal extends UnitAction` com nomes e comportamentos completamente diferentes
- **Impacto:** Confusão total em stack traces, debugging e code navigation. `fireBreath.ts` deve conter `class FireBreath`, `web.ts` deve conter `class Web`.

### BUG-04 — `UnitStatus.Slowed` sem `break` no switch
- **Severidade:** ALTO
- **Arquivo:** `src/engine/unit.ts`, linhas 173–179
- **Evidência:**
  ```ts
  case UnitStatus.Slowed:
    this.mp--
  default:  // ← fallthrough sem break
    break
  ```
- **Impacto:** Em TypeScript/JS, o fallthrough é silencioso aqui porque `default` só tem `break`. Funciona por acidente — mas o comportamento correto não é óbvio e viola a lei do mínimo espanto. Um `break` explícito deve estar após `this.mp--`.

### BUG-05 — Zero testes reais
- **Severidade:** CRÍTICO
- **Arquivo:** `package.json`, linha 10
- **Evidência:** `"test": "npm run lint && npm run build"` — isso não é um test suite
- **Impacto:** Qualquer mudança na engine, ações, pathfinding ou geração de nível é completamente cega. Regressões são indetectáveis automaticamente.

### BUG-06 — Dependências criticamente desatualizadas (9 anos de defasagem)
- **Severidade:** CRÍTICO
- **Arquivo:** `package.json`
- **Evidência:** React 15 (2017), TypeScript 2 (2017), Webpack 2 (2017), tslint (deprecated 2019), `@types/react: ^15`, `animejs: ^2`
- **Impacto:** Vulnerabilidades de segurança conhecidas, APIs removidas, incompatibilidade com tooling moderno, tslint já não recebe atualizações de segurança.

---

## 6. Code Smells Encontrados

### CS-01 — Typo no nome do getter (usado em toda a base)
- **Smell:** Nome incorreto/ambíguo
- **Arquivo:** `src/engine/game.ts`, linha 41
- **Evidência:** `get currenFaction()` — falta o `t` (deveria ser `currentFaction`)
- **Impacto:** Todo o código que chama `.currenFaction` perpetua o erro. Já propagou para `unit.ts`, `opponentAi.ts`, `stageView/store.ts`.
- **Refatoração:** Rename global de `currenFaction` para `currentFaction`. Risco: baixo (TypeScript vai apontar todos os usos).

### CS-02 — Getter `cells` recomputa e ordena a cada acesso
- **Smell:** Performance — operação cara em getter
- **Arquivo:** `src/engine/map.ts`, linhas 84–91
- **Evidência:** `get cells()` chama `CENTER.range(this.size).map(this.cellAt).sort(...)` toda vez que é acessado
- **Impacto:** `map.cells` é chamado no `render()` do componente `Map`, na geração de nível, no flood-fill indiretamente. O sort de ~300 células a cada render é desperdício.
- **Refatoração:** Cachear o resultado em uma propriedade privada, invalida apenas quando necessário. Risco: baixo.

### CS-03 — BFS com `splice(0,1)` — O(n²) em vez de O(n)
- **Smell:** Performance — algoritmo ineficiente
- **Arquivo:** `src/engine/map.ts`, linha 102
- **Evidência:** `toProcess.splice(0, 1)[0]` remove o primeiro elemento de um Array, que é O(n) pois desloca todos os outros elementos
- **Impacto:** Para mapas grandes, o pathfinding degrada quadraticamente. Um `Map` de radius 10 tem ~331 células. `splice(0,1)` sobre arrays dessa magnitude é perceptível.
- **Refatoração:** Usar um índice cursor (`let i = 0; while(i < toProcess.length)`) ou uma fila (linked list). Risco: baixo, algoritmo tem bom teste implícito pelo jogo funcionando.

### CS-04 — `gid()` — contador global não reseta entre jogos
- **Smell:** Mutable global state / Temporary Field
- **Arquivo:** `src/engine/gid.ts`
- **Evidência:** `let GID = 0` no módulo — IDs nunca resetam mesmo se o jogo recomeçar
- **Impacto:** Se o jogador jogar muitas partidas, IDs crescem indefinidamente. Não há colisão de ID porque o jogo nunca cria múltiplos `Game` simultaneamente, mas é uma bomba relógio se isso mudar. Além disso, IDs gerados dependem da ordem de instanciação — não determinístico para debug.
- **Refatoração:** Injetar o gerador de ID como dependência de `Game`, ou usar `crypto.randomUUID()`. Risco: médio.

### CS-05 — `params: any = {}` na base de UnitAction
- **Smell:** Perda de tipagem
- **Arquivo:** `src/engine/actions/action.ts`, linha 32
- **Evidência:** `params: any = {}`
- **Impacto:** Cada subclasse redefine `params` com tipo correto, mas a base aceita qualquer coisa. `UnitAi` acessa `action.action.params.area` diretamente em `src/ui/stageView/store.ts:71` sem tipo — acessa propriedade inexistente silenciosamente para ações que não têm `area`.
- **Refatoração:** Usar generic `params: P = {}` com tipo default. Risco: médio.

### CS-06 — `debug()` sempre emite para console
- **Smell:** Log sem controle de ambiente
- **Arquivo:** `src/utils.ts`, linhas 24–27
- **Evidência:** `console.log(message, ...)` sem verificar `NODE_ENV` ou qualquer flag
- **Impacto:** Produção tem logs verbosos em todo fluxo de jogo, storage, AI. O comentário `// tslint:disable-next-line:no-console` confirma que o linter sabe que é problemático.
- **Refatoração:** `if (process.env.NODE_ENV !== 'production') console.log(...)`. Risco: mínimo.

### CS-07 — `createLevel.ts` duplica lógica de posicionamento de unidades
- **Smell:** Código duplicado
- **Arquivo:** `src/content/createLevel.ts`, linhas 70–99
- **Evidência:** O bloco para adicionar unidades do jogador (linhas 70–82) e o bloco para adicionar inimigos (linhas 85–99) são estruturalmente idênticos com parâmetros diferentes
- **Refatoração:** Extrair função `placeUnitsNear(game, factionId, units, origin, map)`. Risco: baixo.

### CS-08 — String refs deprecated em dois componentes
- **Smell:** API deprecated
- **Arquivos:** `src/ui/stageView/index.tsx` (linhas 72–74: `this.refs.map`, `this.refs.svg`), `src/ui/stageView/things.tsx` (linha 30: `this.refs[unit.id]`)
- **Evidência:** String refs foram deprecated no React 16 e removidas no React 18
- **Impacto:** Já não funcionam no React moderno. Impedem upgrade.
- **Refatoração:** Usar `React.createRef()` / `useRef()`. Risco: baixo para funcionalidade, obrigatório para upgrade.

### CS-09 — `Map.shouldComponentUpdate` retorna `false` hardcoded
- **Smell:** Lógica de render incorreta
- **Arquivo:** `src/ui/stageView/map.tsx`, linhas 13–15
- **Evidência:** `shouldComponentUpdate({ store }) { return false }`
- **Impacto:** O componente de mapa nunca re-renderiza. Funciona hoje porque o terreno é estático mid-game, mas qualquer feature que mude o mapa (Terrain.Wall adicionado dinamicamente) ficará invisível.
- **Refatoração:** Comentar a lógica, ou usar `React.PureComponent`, ou fazer comparação correta. Risco: baixo.

### CS-10 — `pickOpponents` em `levels.ts` é recursiva sem limite de profundidade
- **Smell:** Especulativo — risco de stack overflow
- **Arquivo:** `src/content/levels.ts`, linhas 49–61
- **Evidência:** `function pickOpponents(value, bag)` chama a si mesma sem limite explícito. Para níveis muito altos, `value` fica grande (ex: nível 100 = value de 1010), e com unidades de custo 1, isso seria 1010 chamadas recursivas.
- **Impacto:** Stack overflow em níveis altos.
- **Refatoração:** Converter para loop iterativo. Risco: baixo.

### CS-11 — `cellsInMap` recursiva sem memoization
- **Smell:** Performance
- **Arquivo:** `src/content/levels.ts`, linhas 23–30
- **Evidência:** `function cellsInMap(size)` se chama recursivamente — para size 10 são 10 chamadas na stack. Tem o comentário `// XXX there might be a better way...`
- **Refatoração:** Fórmula fechada: `3 * size * size - 3 * size + 1` para hexágonos. Risco: mínimo.

### CS-12 — Typo visível em produção: "Satus:" no sidebar
- **Smell:** Bug de UX
- **Arquivo:** `src/ui/stageView/sidebar.tsx`, linha 133
- **Evidência:** `Satus: {statuses.join() || '—'}` — falta o 't'
- **Refatoração:** Trivial. Risco: zero.

### CS-13 — Comentário errado no game.ts
- **Smell:** Comentário enganoso
- **Arquivo:** `src/engine/game.ts`, linha 16
- **Evidência:** `"The class has to purposes"` — "to" deveria ser "two"

### CS-14 — `dragon.ts` com description vazia
- **Smell:** Dado incompleto
- **Arquivo:** `src/engine/units/dragon.ts`, linha 7
- **Evidência:** `description: ''`
- **Impacto:** UI do shop não exibe descrição ao hover sobre Dragon (único dos 16 units sem description).

---

## 7. Arquitetura e Acoplamento

### Camadas identificadas:
```
[UI/React] → [Store/State] → [Engine/Domain] ← [AI]
                                    ↑
                              [Content/Levels]
```

### Dependências problemáticas:

**Store Pattern não-convencional:**
O `Store<S>` em `src/ui/utils/store.ts` guarda uma referência direta ao `React.Component` e chama `setState` nele. Isso é um pattern customizado que imita Redux/MobX de forma minimalista. Funciona para a escala atual, mas acopla a store à árvore de componentes React. `MainStore` e `StageView.Store` herdam desse padrão.

**Game mutável dentro do React state:**
Em `mainStore.tsx`, o objeto `Game` (altamente mutável) é armazenado dentro do estado React:
```ts
currentGame?: { game: Game, ... }
```
React assume imutabilidade para otimizações. Mutações em `game` não disparam re-renders automaticamente — o código usa `forceUpdate()` explicitamente via `this.set({})` para contornar isso.

**AI acopla-se à Store da UI:**
`OpponentAi` recebe uma `Store` (UI layer) no construtor e chama `this.store.forceUpdate()` a cada passo da AI. Isso inverte a dependência — a lógica de jogo chama de volta a UI em vez de emitir eventos para a UI reagir. O engine já tem um event bus (`game.emit/listen`), que deveria ser o canal para isso.

**`UnitAi.getAction` chama `performAction` para scoring:**
`src/ai/unitAi.ts:81` chama `action.performAction(target)` para calcular o score sem executar. Isso funciona porque `performAction` é puro (retorna dados sem side effects), mas viola o princípio do mínimo espanto — um método chamado `perform` deveria executar.

---

## 8. Testes

**Situação atual:** Zero testes. O script `npm test` executa lint + build.

**O que está implicitamente testado pelo jogo funcionando:**
- Matemática de hexágonos (se `Hex.range/distance` quebrar, o jogo trava visualmente)
- Flood-fill básico (se quebrar, units não se movem)
- Actions básicas (se quebrar, botões não funcionam)

**O que não está testado (e deveria):**
1. `Hex` — cálculos de distância, range, circle, neighbors
2. `HexMap.flood` — pathfinding correto, células bloqueadas, target encontrado
3. `Unit.takeDamage` — healing (damage negativo), morte, resistência
4. `Unit.tickTurn` — expiração de status, efeito de Burning/Slowed
5. `checkGameOver` — condição de vitória/derrota
6. `createLevel` — mapa gerado dentro dos bounds, units posicionadas corretamente
7. `generateLevel` — progressão de level (enemy value, reward, map size)
8. `storage.load/save` — serialização/deserialização correta, unidade desconhecida
9. `UnitAction.execute` — deduza mana, marque actionPerformed, aplique resultado
10. `pickOpponents` — totalCost dentro do budget, sem unidades com custo > value

**Testes a criar primeiro (maior ROI):**
1. **`hex.test.ts`** — puro JS, zero dependências, cobre a base do jogo inteiro
2. **`map.test.ts`** — flood-fill com mapa simples, casos de borda
3. **`unit.test.ts`** — takeDamage, tickTurn, status effects
4. **Framework recomendado:** Vitest (compatível com TypeScript moderno, rápido, sem config)

---

## 9. Segurança

**Achados:**

**SEC-01 — Confiança cega em dados do localStorage:**
- **Arquivo:** `src/ui/storage.ts`, linhas 28–29
- **Evidência:** `party: rawData.party.map(u => units[u])` — se `u` não corresponder a uma chave em `units`, o resultado é `undefined`. Isso pode corromper a party silenciosamente.
- **Risco:** Médio — dados corrompidos podem quebrar o jogo em runtime. Um atacante com acesso ao localStorage pode injetar dados arbitrários.
- **Correção:** Validar que `units[u]` existe antes de usar, ou usar um schema validator simples.

**SEC-02 — Sem validação de input em `generateLevel(number)`:**
- **Arquivo:** `src/content/levels.ts`, linha 69
- **Evidência:** `generateLevel(number)` — `number` não tem tipo TypeScript (é `any` implícito). Se chamado com `NaN` ou valor negativo, produz resultados indefinidos.
- **Risco:** Baixo — não há surface de ataque externa, mas robustez interna falha.

**SEC-03 — Produção com source maps expostos:**
- **Arquivo:** `webpack.config.js`, linha 51–53
- **Evidência:** `devtool: '#source-map'` em produção — expõe o código TypeScript original em produção
- **Risco:** Baixo para um jogo open-source/hobby, mas seria crítico em produto comercial

**SEC-04 — Sem sanitização de dados no localStorage:**
- Dados são lidos via `JSON.parse(data)` sem schema validation. Um `null` em `rawData.party` causaria crash.

---

## 10. Performance

**PERF-01 — `HexMap.cells` getter ordena toda vez:**
Cada render do `<Map>` chama `store.state.game.map.cells` que executa `range + sort` sobre ~300 elementos. Solução: cachear.

**PERF-02 — BFS com `splice(0,1)` é O(n²):**
Pathfinding em `map.ts:102`. Para o tamanho atual de mapa (radius 5-10), é aceitável mas não é gratuito — o jogo chama `flood` para cada unidade da AI, a cada turno, para computar moveTargets e encontrar caminho.

**PERF-03 — `moveTargets()` recalculado em loop na AI:**
Em `opponentAi.ts:57`, `unit.moveTargets()` é chamado dentro de um `for` loop a cada passo do caminho. `moveTargets()` por sua vez chama `flood()`. Isso é O(unidades × passos × mapa) por turno da AI.

**PERF-04 — `Things.tsx` cria closure de anime.js a cada movimento:**
Cada chamada a `onUnitMove` cria um loop `for...of` com `await anime({...}).finished` para cada passo do path. Para paths longos, o frame fica bloqueado pela animação sequencial.

**PERF-05 — `UnitAi.getAction` chama `performAction` para TODOS os targets de TODAS as ações:**
Em `unitAi.ts:80-82`, para cada unidade do AI, para cada ação da unidade, para cada target da ação, `performAction` é chamado. Isso é O(unidades × ações × targets). Para a escala atual é ok, mas cresce rapidamente com mais unidades ou ações AoE.

---

## 11. Dívida Técnica Priorizada

| Item | Impacto | Esforço | Risco | Ordem |
|---|---|---|---|---|
| Corrigir BUG-01 (GAME_OVER sempre re-lança) | Alto | Mínimo | Baixo | 1 |
| Corrigir BUG-03 (classes nomeadas `Heal`) | Alto | Mínimo | Baixo | 2 |
| Corrigir CS-12 (typo "Satus:") | Baixo | Mínimo | Zero | 3 |
| Corrigir BUG-04 (missing break em switch) | Médio | Mínimo | Baixo | 4 |
| Corrigir CS-06 (debug sempre loga) | Médio | Baixo | Zero | 5 |
| Corrigir CS-07 (duplicação em createLevel) | Médio | Baixo | Baixo | 6 |
| Upgrade tslint → ESLint | Alto | Médio | Baixo | 7 |
| Criar testes unitários (hex, map, unit) | Crítico | Médio | Baixo | 8 |
| Corrigir CS-02 (getter cells cachear) | Médio | Baixo | Baixo | 9 |
| Corrigir CS-03 (BFS com splice → cursor) | Médio | Baixo | Baixo | 10 |
| Rename `currenFaction` → `currentFaction` | Baixo | Mínimo | Baixo | 11 |
| Upgrade React 15 → 18 (remove string refs) | Alto | Alto | Alto | 12 |
| Upgrade Webpack 2 → 5 + TypeScript 5 | Alto | Alto | Médio | 13 |
| Desacoplar AI da Store (usar event bus) | Médio | Médio | Médio | 14 |
| Corrigir CS-10 (recursão → iteração) | Baixo | Baixo | Baixo | 15 |
| Validação de dados do localStorage | Médio | Baixo | Baixo | 16 |

---

## 12. Plano de Refatoração em Etapas

### Etapa 1: Correções seguras e imediatas (sem risco)
- `opponentAi.ts:83`: adicionar `return` dentro do `if (e === 'GAME_OVER')`
- `fireBreath.ts` e `web.ts`: renomear `class Heal` para `class FireBreath` e `class Web`
- `sidebar.tsx:133`: `Satus:` → `Status:`
- `unit.ts:177`: adicionar `break` após `this.mp--`
- `utils.ts:25`: gate de `process.env.NODE_ENV` no `debug()`
- `game.ts:16`: corrigir comentário "to purposes" → "two purposes"
- `dragon.ts`: adicionar description

### Etapa 2: Melhoria de organização e qualidade (baixo risco)
- Extrair função `placeUnitsNear` em `createLevel.ts` (eliminar duplicação)
- Converter `cellsInMap` para fórmula fechada
- Converter `pickOpponents` de recursiva para iterativa
- Cachear `HexMap.cells` como propriedade privada
- Substituir `splice(0,1)` por cursor no BFS
- Migrar tslint → ESLint com `@typescript-eslint`
- Adicionar validação básica em `storage.load`

### Etapa 3: Renaming e acoplamento leve
- Rename global `currenFaction` → `currentFaction`
- Tipar `params` na `UnitAction` base com generic
- Mover `throw 'GAME_OVER'` para `throw new GameOverError()`

### Etapa 4: Testes e segurança
- Instalar Vitest: `npm i -D vitest`
- Criar `src/engine/__tests__/hex.test.ts` (sem mocks — lógica pura)
- Criar `src/engine/__tests__/map.test.ts`
- Criar `src/engine/__tests__/unit.test.ts`
- Criar `src/ui/__tests__/storage.test.ts`
- Adicionar schema validation no `storage.load`
- Atualizar `"test"` no `package.json`

### Etapa 5: Upgrade e melhorias estruturais (alto esforço, alto valor)
- Upgrade TypeScript 2 → 5 (breaking: algumas APIs de tipos mudaram)
- Upgrade Webpack 2 → 5 (breaking: `loaders` → `rules`, plugins mudaram)
- Upgrade React 15 → 18 (breaking: string refs removidos, lifecycle methods deprecated)
  - Converter `this.refs.map` → `React.createRef()`
  - Converter componentes de classe para função onde fizer sentido
- Substituir `animejs 2` → `animejs 3`
- Desacoplar `OpponentAi` da `Store` — emitir eventos via `game.emit` e a UI escuta

---

## 13. Recomendações Finais

1. **Comece pelos bugs zero-risco da Etapa 1.** São mudanças de 1-5 linhas cada, sem risco de regressão, que corrigem comportamentos incorretos ativos.

2. **Não faça o upgrade de React antes de ter testes.** Upgrade de React 15→18 sem testes é uma receita para bugs silenciosos. A ordem correta: testes → upgrade.

3. **Use Vitest, não Jest.** Vitest entende TypeScript nativamente, é mais rápido, e não exige Babel ou `ts-jest`. Com o tsconfig atual (target ES5, strictNullChecks), funciona sem configuração especial.

4. **O maior retorno técnico é `hex.test.ts`.** A classe `Hex` é o alicerce de toda a lógica de jogo e é 100% pura (sem dependências). Testá-la dá confiança gratuita para refatorar o restante.

5. **O event bus já existe — use-o para a AI.** `game.emit/listen` está implementado e funcional. A AI não deveria chamar `store.forceUpdate()` diretamente — deveria emitir um evento que a UI escuta. Isso desacopla completamente a camada de AI da camada de UI.

6. **Preserve a arquitetura engine/UI separada.** É o melhor aspecto do projeto. Qualquer refatoração deve respeitar que `src/engine/` não importa nada de `src/ui/`.

7. **O `params.area` acessado sem tipo em `stageView/store.ts:71`** é um bug potencial — se uma action que não tem `area` for selecionada e o mouse passar sobre o mapa, `action.action.params.area` retorna `undefined` e o código continua sem erro mas sem área de efeito. Adicionar tipagem em `params` resolve isso estruturalmente.
