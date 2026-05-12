# 📊 Fitmind Analytics — PostHog

Este documento explica como o PostHog foi integrado ao Fitmind, o que é
rastreado, e como rodar dashboards úteis para entender o produto.

---

## 1. Setup rápido

### 1.1 Criar projeto no PostHog

1. Vá em [posthog.com](https://posthog.com) e crie uma conta gratuita.
2. Crie um **Project** chamado `fitmind`.
3. Em **Project Settings → Project API Key**, copie a chave (começa com
   `phc_...`) e a **API host** (geralmente `https://us.i.posthog.com` ou
   `https://eu.i.posthog.com`).

### 1.2 Variáveis de ambiente

Adicione no `.env.local` (desenvolvimento) e no painel da Vercel (produção):

```bash
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Opcional: habilita captura em localhost (default = desativado).
# Útil quando você quer testar a integração antes de deploy.
VITE_POSTHOG_DEBUG=0
```

Sem essas variáveis o app continua funcionando normalmente — o módulo
`lib/analytics.ts` detecta a ausência da chave e vira no-op silencioso.

### 1.3 Instalar dependências

```bash
npm install
```

As deps `posthog-js` e `@posthog/react` já estão no `package.json`.

---

## 2. Arquitetura

```
┌────────────────────────────────────────────────────────────┐
│  index.tsx                                                 │
│    initAnalytics()  ← chamado uma vez no boot              │
│    <PostHogProvider client={posthogClient}>                │
│      <BrowserRouter>                                       │
│        <AppContext>                                        │
│          <App />                                           │
│            ├─ <PostHogPageView />  ← rastreia rotas SPA    │
│            └─ ... componentes ...                          │
└────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────┐
│  lib/analytics.ts  — fonte única de tudo                   │
│                                                            │
│    • initAnalytics()      → boot                           │
│    • identifyUser()       → login                          │
│    • setUserProperties()  → quando o perfil muda           │
│    • track(event, props)  → eventos customizados           │
│    • trackPageview(path)  → navegação SPA                  │
│    • resetAnalytics()     → logout                         │
│                                                            │
│    AnalyticsEvent.*  → catálogo tipado de eventos          │
└────────────────────────────────────────────────────────────┘
```

**Por que um wrapper?**
- Type-safety (TypeScript pega evento errado em compile time).
- Se um dia trocar PostHog por outro analytics, muda 1 arquivo.
- No-op automático se `VITE_POSTHOG_KEY` não estiver setada.

---

## 3. Catálogo de eventos

Lista completa em `lib/analytics.ts` no objeto `AnalyticsEvent`. Resumo
agrupado:

### Auth
| Evento | Quando dispara | Propriedades-chave |
|---|---|---|
| `auth_viewed` | Tela de auth abre | — |
| `signup_started` | Submit do signup | `has_referral` |
| `signup_completed` | Conta criada | `provider`, `has_referral` |
| `signup_failed` | Erro no signup | `reason` |
| `login_attempted` | Submit do login | `provider` |
| `login_completed` | Sessão criada | `provider` |
| `login_failed` | Erro no login | `provider`, `reason` |
| `oauth_started` | Botão Google | `provider` |
| `password_reset_requested` | Pediu reset de senha | — |
| `logout_clicked` | Sair da conta | — |

### Onboarding (funil)
| Evento | Propriedades |
|---|---|
| `onboarding_started` | `initial_step` |
| `onboarding_step_viewed` | `step_index`, `step_name`, `total_steps` |
| `onboarding_abandoned` | `step_index`, `step_name` (no `beforeunload`) |
| `onboarding_completed` | dados do perfil agregados |

29 nomes de step mapeados em `ONBOARDING_STEP_NAMES` em
`OnboardingFlow.tsx`. Veja um funil real em PostHog:
**Insights → New funnel → Steps: onboarding_step_viewed (step_name=welcome) → onboarding_step_viewed (step_name=glp_status) → ... → onboarding_completed**.

### Monetização
| Evento | Propriedades |
|---|---|
| `subscription_page_viewed` | `default_plan`, `source` |
| `subscription_plan_selected` | `plan`, `price_brl` |
| `checkout_started` | `plan`, `has_trial`, `has_affiliate` |
| `checkout_redirected_to_stripe` | `plan` |
| `checkout_failed` | `plan`, `error` |
| `payment_success_viewed` | `type` (pro/consultation) |
| `purchase_confirmed` | `type`, `sync_source` |
| `pro_feature_blocked` | `feature` (qual feature PRO bateu paywall) |

### Refeições & engagement
| Evento | Propriedades |
|---|---|
| `meal_log_started` | `source` (fab/summary_card/smart_log_button) |
| `meal_log_mode_selected` | `mode` (type/voice/camera/manual/favorites) |
| `ai_food_search_used` | `source`, `ingredient_count`, `success` |
| `meal_logged` | `source`, `meal_type`, `calories`, `protein_g`, ... |
| `meal_log_failed` | `source`, `reason`, `error` |
| `meal_log_cancelled` | `source` |
| `water_logged` | `total_l`, `target_l`, `percent_of_goal` |
| `quick_protein_added` | `grams_added`, `total_grams` |
| `weight_logged` | `weight_kg`, `delta_kg`, `delta_from_start_kg`, `distance_to_target_kg` |
| `weight_milestone_hit` | `old_weight_kg`, `new_weight_kg` |
| `side_effect_logged` | `effect_count`, `effect_types`, `has_notes` |

### Navegação & Referral
| Evento | Propriedades |
|---|---|
| `tab_switched` | `to`, `label` |
| `fab_action_clicked` | `action` |
| `calendar_date_changed` | `date`, `days_ago`, `is_today` |
| `referral_code_captured` | `referral_code`, `source` |
| `referral_dashboard_viewed` | — |
| `referral_share_clicked` | `method` (copy_link/native_share) |
| `theme_toggled` | `new_theme` |
| `report_generated` | `range` |
| `error_boundary_triggered` | `error_message`, `stack`, `component_stack` |

### Pageviews automáticos
Toda mudança de rota (React Router) dispara um `$pageview` com:
- `path` — rota completa (`/meals`, `/settings/account`...)
- `section` — categoria amigável (summary/meals/diet/workouts/...)

---

## 4. Person Properties

Quando o usuário loga, `identifyUser()` vincula o `distinct_id` ao
`auth.users.id` do Supabase. Toda vez que `userData` muda no contexto,
`setUserProperties()` sincroniza:

| Property | Origem |
|---|---|
| `email` | session.user.email |
| `is_pro` | profiles.is_pro |
| `subscription_status` | profiles.subscription_status |
| `plan` | "pro" ou "free" |
| `glp_status` | profiles.glp_status |
| `medication` | profiles.medication |
| `gender`, `age`, `activity_level` | profiles.* |
| `streak` | profiles.streak |
| `is_nutritionist` | RPC is_nutritionist |
| `height_cm`, `current_weight_kg`, `target_weight_kg` | profiles.* |

Isso permite filtros como:
- "Usuários PRO que registraram refeição nos últimos 7 dias"
- "Funil de onboarding agrupado por `glp_status`"
- "Conversion rate de checkout por `medication`"

---

## 5. Dashboards prontos pra montar no PostHog

Sugestões de insights que respondem perguntas reais do produto:

### 5.1 Funnel: Aquisição → Ativação
```
Step 1: $pageview (path=/auth)
Step 2: signup_completed
Step 3: onboarding_completed
Step 4: meal_logged (primeiro evento)
```
Quebre por `referral_code` para ver afiliados que trazem usuários que
chegam até refeição (não só clique).

### 5.2 Funnel: Checkout
```
Step 1: subscription_page_viewed
Step 2: subscription_plan_selected
Step 3: checkout_started
Step 4: checkout_redirected_to_stripe
Step 5: payment_success_viewed
Step 6: purchase_confirmed
```
Drop-off entre 4 e 5 = pessoas que cancelaram dentro do Stripe.

### 5.3 Funnel: Onboarding (drop-off por step)
```
Step 1: onboarding_step_viewed (step_name=welcome)
Step 2: onboarding_step_viewed (step_name=glp_status)
...
Step N: onboarding_completed
```
Identifica QUAL pergunta espanta usuário. (Geralmente: peso atual,
investimento mensal, ou perguntas longas de funil.)

### 5.4 Trends: Engajamento diário
- DAU = pessoas únicas que dispararam qualquer evento
- Sticky users = pessoas que fizeram `meal_logged` 3+ dias na última semana
- Comparar antes/depois de cada release

### 5.5 Retention: D1 / D7 / D30
- Cohort por dia de signup
- "Returning event" = `meal_logged`
- Quebra por `plan` para ver retention PRO vs Free

### 5.6 Recursos mais e menos usados
Trends agrupado por `event_name`, somente eventos custom, ordenado por
volume. Você vê na hora quais features ninguém toca.

### 5.7 Paywall heatmap
Filtro por `pro_feature_blocked`, agrupado por `feature`. Mostra qual
feature PRO está convertendo mais cliques de free → checkout.

### 5.8 Onde os usuários param (drop-off paths)
PostHog → **Paths** → starting at `$pageview` → group by `path`.
Mostra os caminhos reais que usuários percorrem e onde abandonam.

### 5.9 Session Replay
Habilitado por padrão com mascaramento de inputs. Filtre por:
- `meal_log_failed` → assiste como o usuário tentou fazer
- `error_boundary_triggered` → vê o crash com contexto

Adicione `data-private` ou `data-ph-private` em qualquer elemento que
deva ser mascarado.

---

## 6. Como adicionar um novo evento

1. Adicione no catálogo em `lib/analytics.ts`:
   ```ts
   export const AnalyticsEvent = {
     // ...
     novoEvento: 'novo_evento',
   } as const;
   ```
2. Chame do componente:
   ```ts
   import { track, AnalyticsEvent } from '../../lib/analytics';
   track(AnalyticsEvent.novoEvento, { propriedade: 'valor' });
   ```

Mantém type-safety, vai aparecer no autocomplete, e tem documentação
centralizada de tudo que é rastreado.

---

## 7. Privacidade

- `person_profiles: 'identified_only'` → eventos anônimos não criam
  perfil (4x mais barato e protege quem não logou).
- `session_recording.maskAllInputs: true` → todos os `<input>` são
  mascarados por padrão.
- Localhost desabilitado por padrão (`VITE_POSTHOG_DEBUG=0`).
- O `name` do usuário **não** vai para o PostHog (apenas email,
  dimensões físicas e dados clínicos relevantes para análise).

Para mascarar um elemento custom em session replay:
```jsx
<div data-private>Conteúdo sensível aqui</div>
```

---

## 8. Troubleshooting

**Eventos não aparecem em produção:**
- Confira `VITE_POSTHOG_KEY` no painel da Vercel.
- Abra o DevTools → Network → busque `posthog.com`. Status 200 = OK.
- No PostHog: **Activity** → ver eventos em tempo real.

**Eventos não aparecem em dev:**
- Por padrão, dev é silencioso. Set `VITE_POSTHOG_DEBUG=1` no
  `.env.local` e reinicie o `npm run dev`.

**Identify não funciona:**
- Confira no PostHog se o `distinct_id` mudou para o user ID após
  login. Caso contrário, veja se `identifyUser()` está sendo chamado
  em `App.tsx` no listener `onAuthStateChange`.

**TypeScript reclama:**
- Rode `npm run lint` para checar.
- Se um event name não existe no `AnalyticsEvent`, adicione antes de
  usá-lo (esse é o propósito do catálogo).

---

## 9. Arquivos modificados

```
+ lib/analytics.ts                                  (novo)
+ components/PostHogPageView.tsx                    (novo)
M index.tsx                                         (init + provider)
M App.tsx                                           (identify/reset/properties)
M components/Auth.tsx                               (auth events)
M components/ErrorBoundary.tsx                      (crash tracking)
M components/MainApp.tsx                            (meal/weight/side_effect)
M components/SmartLogModal.tsx                      (AI modes + log)
M components/SubscriptionPage.tsx                   (paywall funnel)
M components/PaymentPage.tsx                        (checkout funnel)
M components/ReferralDashboard.tsx                  (referral share)
M components/ReportGeneratorModal.tsx               (report gen)
M components/core/BottomNav.tsx                     (tab switches)
M components/onboarding/OnboardingFlow.tsx          (29-step funnel)
M components/payment/SuccessPage.tsx                (purchase confirm)
M components/tabs/SettingsTab.tsx                   (theme/logout)
M components/tabs/SummaryTab.tsx                    (water/protein/calendar)
M package.json                                      (deps)
```
