
import { createClient } from '@supabase/supabase-js';

// Estas são a URL e a Chave Anônima (Anon Key) corretas do Supabase para esta aplicação React (client-side).
// O método de conexão é o padrão para a biblioteca @supabase/supabase-js.
// Os exemplos de código fornecidos no prompt são para um projeto Next.js, que usa uma configuração diferente.
export const supabaseUrl = 'https://jkjkbawikpqgxvmstzsb.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpramtiYXdpa3BxZ3h2bXN0enNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDcyMDksImV4cCI6MjA3ODYyMzIwOX0.xJdeEePMhcbp6WstT_GDz3VwiiGoAYuHE9A5Wlz5RUY';

// Cria uma instância única do cliente Supabase para interagir com o banco de dados.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
