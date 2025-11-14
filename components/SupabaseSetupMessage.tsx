
import React from 'react';

export const SupabaseSetupMessage: React.FC = () => (
  <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-yellow-50 text-yellow-900">
    <div className="w-16 h-16 bg-yellow-200 text-yellow-600 rounded-2xl flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </div>
    <h1 className="text-2xl font-bold">Configuração Pendente</h1>
    <p className="mt-2 max-w-md">
      Para conectar o aplicativo, você precisa adicionar suas chaves do Supabase.
    </p>
    <div className="mt-6 p-4 bg-yellow-100 rounded-lg text-left w-full max-w-md">
      <p className="font-semibold">Passo-a-passo:</p>
      <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
        <li>Abra o arquivo: <code className="bg-yellow-200 px-1 py-0.5 rounded font-mono">supabaseClient.ts</code></li>
        <li>Encontre as linhas com <code className="bg-yellow-200 px-1 py-0.5 rounded font-mono">'SUA_URL_DO_SUPABASE'</code> e <code className="bg-yellow-200 px-1 py-0.5 rounded font-mono">'SUA_CHAVE_ANON_PUBLIC'</code>.</li>
        <li>Substitua esses textos pelas suas chaves reais do seu projeto Supabase.</li>
      </ol>
    </div>
    <p className="text-xs text-yellow-700 mt-4">
      Depois de salvar o arquivo, a aplicação será recarregada automaticamente.
    </p>
  </div>
);
