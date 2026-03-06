import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

const COOKIE_NAME = 'fitmind_affiliate_code';
const COOKIE_DURATION = 30; // dias

export const useAffiliateTracker = () => {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    // 1. Tentar pegar do searchParams (depois do # no HashRouter)
    let refCode = searchParams.get('ref') || searchParams.get('cupom');

    // 2. Se não encontrou, tentar pegar do window.location.search (antes do #)
    if (!refCode) {
      const urlParams = new URLSearchParams(window.location.search);
      refCode = urlParams.get('ref') || urlParams.get('cupom');
    }

    if (refCode) {
      // Normalizar o código para maiúsculo para consistência
      const code = refCode.toUpperCase();
      
      // Verificar se já existe um cookie e se é diferente
      const currentCookie = Cookies.get(COOKIE_NAME);

      if (currentCookie !== code) {
        // Salvar o cookie com validade de 30 dias
        Cookies.set(COOKIE_NAME, code, { expires: COOKIE_DURATION });
        
        // Opcional: Mostrar feedback visual para o usuário
        console.log(`Afiliado detectado: ${code}`);
        addToast(`Cupom ${code} ativado com sucesso!`, 'success');
      }

      // Limpar os parâmetros da URL para o cliente (esconder o código)
      // Se estiver no search (antes do #)
      if (window.location.search.includes('ref=') || window.location.search.includes('cupom=')) {
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } 
      // Se estiver no hash (depois do #)
      else if (window.location.hash.includes('ref=') || window.location.hash.includes('cupom=')) {
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 0) {
          const newUrl = window.location.pathname + window.location.search + hashParts[0];
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [searchParams, addToast]);

  // Função auxiliar para recuperar o código quando precisar (ex: no checkout)
  const getAffiliateCode = () => {
    return Cookies.get(COOKIE_NAME);
  };

  return { getAffiliateCode };
};
