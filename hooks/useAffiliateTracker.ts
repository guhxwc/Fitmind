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
    const refCode = searchParams.get('ref') || searchParams.get('cupom');

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
    }
  }, [searchParams, addToast]);

  // Função auxiliar para recuperar o código quando precisar (ex: no checkout)
  const getAffiliateCode = () => {
    return Cookies.get(COOKIE_NAME);
  };

  return { getAffiliateCode };
};
