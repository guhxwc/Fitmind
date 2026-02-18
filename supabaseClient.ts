
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Tenta ler das variáveis de ambiente primeiro, fallback para os valores hardcoded (se houver)
export const supabaseUrl = process.env.SUPABASE_URL || 'https://jkjkbawikpqgxvmstzsb.supabase.co';
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpramtiYXdpa3BxZ3h2bXN0enNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDcyMDksImV4cCI6MjA3ODYyMzIwOX0.xJdeEePMhcbp6WstT_GDz3VwiiGoAYuHE9A5Wlz5RUY';

// Cria uma instância única do cliente Supabase para interagir com o banco de dados.
// Se as chaves estiverem vazias, o cliente pode não funcionar corretamente até que sejam configuradas.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
