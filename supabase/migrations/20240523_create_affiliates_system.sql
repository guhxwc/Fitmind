-- Tabela de Afiliados (Cupons e Links)
create table public.affiliates (
  id uuid not null default gen_random_uuid (),
  user_id uuid references auth.users(id) on delete cascade, -- O dono do cupom (ex: Vitinho)
  code text not null unique, -- O código do cupom (ex: "VITINHO")
  commission_rate numeric(5,2) not null default 0.00, -- Porcentagem de comissão (ex: 10.00 para 10%)
  discount_rate numeric(5,2) not null default 0.00, -- Porcentagem de desconto para o cliente (ex: 5.00 para 5%)
  clicks integer not null default 0, -- Contador de cliques no link
  conversions integer not null default 0, -- Contador de vendas realizadas
  balance numeric(10,2) not null default 0.00, -- Saldo disponível para saque
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint affiliates_pkey primary key (id)
);

-- Tabela de Transações de Afiliados (Extrato)
create table public.affiliate_transactions (
  id uuid not null default gen_random_uuid (),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  amount numeric(10,2) not null, -- Valor da comissão (positivo) ou saque (negativo)
  type text not null check (type in ('commission', 'payout', 'adjustment')), -- Tipo da transação
  description text, -- Descrição (ex: "Venda #12345")
  reference_id text, -- ID externo (ex: ID da transação no Stripe)
  created_at timestamp with time zone not null default now(),
  constraint affiliate_transactions_pkey primary key (id)
);

-- Adicionar coluna de referência na tabela de perfis (quem indicou este usuário)
alter table public.profiles 
add column if not exists referred_by text; -- Armazena o código do afiliado (ex: "VITINHO")

-- Habilitar RLS (Segurança)
alter table public.affiliates enable row level security;
alter table public.affiliate_transactions enable row level security;

-- Políticas de Segurança (RLS)

-- 1. Afiliados podem ver seus próprios dados
create policy "Afiliados podem ver seus próprios dados"
on public.affiliates
for select
using (auth.uid() = user_id);

-- 2. Público pode ler cupons (para validar se o cupom existe no checkout)
create policy "Público pode ler códigos de afiliados"
on public.affiliates
for select
using (true);

-- 3. Afiliados podem ver suas próprias transações
create policy "Afiliados podem ver suas próprias transações"
on public.affiliate_transactions
for select
using (
  exists (
    select 1 from public.affiliates
    where affiliates.id = affiliate_transactions.affiliate_id
    and affiliates.user_id = auth.uid()
  )
);

-- Índices para performance
create index if not exists affiliates_code_idx on public.affiliates (code);
create index if not exists affiliates_user_id_idx on public.affiliates (user_id);
create index if not exists affiliate_transactions_affiliate_id_idx on public.affiliate_transactions (affiliate_id);
